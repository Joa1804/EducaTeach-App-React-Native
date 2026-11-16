import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
  type UserCredential,
} from 'firebase/auth';

import {
  EmailJaCadastradoError,
  autenticar,
  vincularContaFirebase,
  type Usuario,
} from '../db/database';
import { getFirebaseAuth, getFirestoreDb } from '../db/firebase';
import type { CadastroDados, LoginDados } from '../lib/validation/auth-schemas';
import { AuthError, MENSAGEM_CREDENCIAIS_INVALIDAS } from './auth-errors';
import { criarNuvemFirestore } from './firebase/nuvem-firestore';
import { apagarToken } from './session-storage';
import { sincronizarEmSegundoPlano } from './sync';

/** Códigos que o Firebase usa para "e-mail ou senha não conferem". */
const CODIGOS_CREDENCIAIS = new Set([
  'auth/invalid-credential',
  'auth/invalid-login-credentials',
  'auth/wrong-password',
  'auth/user-not-found',
]);

export function codigoFirebase(error: unknown): string | null {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const { code } = error as { code: unknown };
    return typeof code === 'string' ? code : null;
  }
  return null;
}

/** Converte erros do Firebase Auth em mensagens da UI, sem vazar detalhes internos. */
export function traduzirErroAuth(error: unknown): Error {
  const codigo = codigoFirebase(error);

  if (codigo && CODIGOS_CREDENCIAIS.has(codigo)) {
    return new AuthError('credenciais-invalidas', MENSAGEM_CREDENCIAIS_INVALIDAS);
  }

  switch (codigo) {
    case 'auth/email-already-in-use':
      return new EmailJaCadastradoError();
    case 'auth/invalid-email':
      return new AuthError('dados-invalidos', 'Por favor, insira um e-mail válido.');
    case 'auth/weak-password':
      return new AuthError('dados-invalidos', 'Escolha uma senha mais forte.');
    case 'auth/network-request-failed':
      return new AuthError('sem-conexao', 'Sem conexão com a internet. Tente novamente.');
    case 'auth/too-many-requests':
      return new AuthError(
        'muitas-tentativas',
        'Muitas tentativas. Aguarde alguns minutos e tente de novo.',
      );
    case 'auth/user-disabled':
      return new AuthError('credenciais-invalidas', 'Esta conta foi desativada.');
    case 'auth/operation-not-allowed':
      return new AuthError(
        'indisponivel',
        'Login por e-mail e senha não está ativado no Firebase.',
      );
    default:
      return error instanceof Error ? error : new Error(String(error));
  }
}

function nomeDaConta(user: User, reserva: string | null, email: string): string {
  return user.displayName?.trim() || reserva?.trim() || email.split('@')[0] || 'Aluno';
}

/**
 * Entra pelo Firebase Auth e liga a conta ao perfil local.
 *
 * Migração de contas antigas: se o Firebase não reconhece o e-mail/senha, mas
 * eles conferem com uma conta criada antes neste aparelho, a conta é criada
 * no Firebase com os mesmos dados e herda o progresso local, que então é
 * enviado para a nuvem.
 */
export async function loginFirebase({ email, senha }: LoginDados): Promise<Usuario> {
  const auth = getFirebaseAuth();

  let credencial: UserCredential;
  let legado: Usuario | null = null;

  try {
    credencial = await signInWithEmailAndPassword(auth, email, senha);
    // Mesmo e-mail e mesma senha de um perfil local antigo: é a mesma pessoa.
    legado = await autenticar(email, senha);
  } catch (error: unknown) {
    const codigo = codigoFirebase(error);

    if (!codigo || !CODIGOS_CREDENCIAIS.has(codigo)) {
      throw traduzirErroAuth(error);
    }

    legado = await autenticar(email, senha);

    if (!legado || legado.firebase_uid !== null) {
      throw new AuthError('credenciais-invalidas', MENSAGEM_CREDENCIAIS_INVALIDAS);
    }

    try {
      credencial = await createUserWithEmailAndPassword(auth, email, senha);
    } catch (erroCriacao: unknown) {
      // A conta Firebase existe com outra senha: não revela isso ao usuário.
      if (codigoFirebase(erroCriacao) === 'auth/email-already-in-use') {
        throw new AuthError('credenciais-invalidas', MENSAGEM_CREDENCIAIS_INVALIDAS);
      }
      throw traduzirErroAuth(erroCriacao);
    }

    await updateProfile(credencial.user, { displayName: legado.nome }).catch(
      (erroPerfil: unknown) => console.warn('Não foi possível salvar o nome:', erroPerfil),
    );
  }

  const perfilLocal = legado && legado.firebase_uid === null ? legado : null;

  const usuario = await vincularContaFirebase(
    {
      uid: credencial.user.uid,
      nome: nomeDaConta(credencial.user, perfilLocal?.nome ?? null, email),
      email,
    },
    { perfilLocalVerificadoId: perfilLocal?.id },
  );

  sincronizarEmSegundoPlano(usuario);

  return usuario;
}

/**
 * Cria a conta no Firebase com o nome no perfil e já registra o aluno no
 * ranking (0 pontos). Encerra a sessão em seguida para manter o fluxo atual:
 * depois do cadastro o aluno faz login.
 */
export async function cadastrarFirebase({ nome, email, senha }: CadastroDados): Promise<void> {
  const auth = getFirebaseAuth();

  let credencial: UserCredential;

  try {
    credencial = await createUserWithEmailAndPassword(auth, email, senha);
  } catch (error: unknown) {
    throw traduzirErroAuth(error);
  }

  try {
    await updateProfile(credencial.user, { displayName: nome });
    await criarNuvemFirestore(getFirestoreDb()).garantirPerfilRanking(credencial.user.uid, nome);
  } catch (error: unknown) {
    // Não impede o cadastro: o perfil do ranking é criado na próxima sincronização.
    console.warn('Cadastro concluído, mas o perfil não foi salvo agora:', error);
  } finally {
    await signOut(auth);
  }
}

/** Retoma a sessão salva pelo Firebase Auth (funciona offline). */
export async function restaurarSessaoFirebase(): Promise<Usuario | null> {
  const auth = getFirebaseAuth();

  // Sessões do login local antigo não valem mais com o Firebase ativo.
  await apagarToken().catch(() => undefined);

  await auth.authStateReady();
  const user = auth.currentUser;

  if (!user) return null;

  const email = user.email ?? `${user.uid}@firebase.local`;
  const usuario = await vincularContaFirebase({
    uid: user.uid,
    nome: nomeDaConta(user, null, email),
    email,
  });

  sincronizarEmSegundoPlano(usuario);

  return usuario;
}

export async function logoutFirebase(): Promise<void> {
  try {
    await signOut(getFirebaseAuth());
  } finally {
    await apagarToken().catch(() => undefined);
  }
}
