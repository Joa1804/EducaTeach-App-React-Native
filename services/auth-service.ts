import {
    autenticar,
    buscarUsuarioPorSessao,
    cadastrarUsuario,
    criarSessao,
    encerrarSessao,
    type Usuario,
} from '../db/database';
import {
    cadastroSchema,
    loginSchema,
    primeiraMensagem,
    type CadastroInput,
    type LoginInput,
} from '../lib/validation/auth-schemas';
import { firebaseHabilitado } from '../db/firebase';
import { AuthError, MENSAGEM_CREDENCIAIS_INVALIDAS } from './auth-errors';
import {
    cadastrarFirebase,
    loginFirebase,
    logoutFirebase,
    restaurarSessaoFirebase,
} from './firebase-auth-service';
import { apagarToken, lerToken, salvarToken } from './session-storage';

export { AuthError, type AuthErrorCode } from './auth-errors';

/**
 * Ponto único de autenticação da UI. Com o Firebase configurado (.env), usa o
 * Firebase Auth e o ranking global; sem ele, mantém as contas locais (SQLite),
 * para o app continuar funcionando em desenvolvimento e sem internet.
 */
export function modoAutenticacao(): 'firebase' | 'local' {
    return firebaseHabilitado() ? 'firebase' : 'local';
}

/** Valida os dados, confere a senha e abre uma sessão persistida no aparelho. */
export async function login(input: LoginInput): Promise<Usuario> {
    const validacao = loginSchema.safeParse(input);

    if (!validacao.success) {
        throw new AuthError('dados-invalidos', primeiraMensagem(validacao.error));
    }

    if (modoAutenticacao() === 'firebase') {
        return loginFirebase(validacao.data);
    }

    const { email, senha } = validacao.data;
    const usuario = await autenticar(email, senha);

    if (!usuario) {
        throw new AuthError('credenciais-invalidas', MENSAGEM_CREDENCIAIS_INVALIDAS);
    }

    const { token } = await criarSessao(usuario.id);
    await salvarToken(token);

    return usuario;
}

/** Cria a conta. Não abre sessão: o usuário volta para o login. */
export async function cadastrar(input: CadastroInput): Promise<void> {
    const validacao = cadastroSchema.safeParse(input);

    if (!validacao.success) {
        throw new AuthError('dados-invalidos', primeiraMensagem(validacao.error));
    }

    if (modoAutenticacao() === 'firebase') {
        await cadastrarFirebase(validacao.data);
        return;
    }

    const { nome, email, senha } = validacao.data;

    await cadastrarUsuario(nome, email, senha);
}

/** Restaura a sessão salva no aparelho. Token vencido ou inválido é descartado. */
export async function restaurarSessao(): Promise<Usuario | null> {
    if (modoAutenticacao() === 'firebase') {
        return restaurarSessaoFirebase();
    }

    const token = await lerToken();

    if (!token) return null;

    const usuario = await buscarUsuarioPorSessao(token);

    if (!usuario) {
        await apagarToken();
    }

    return usuario;
}

/** Encerra a sessão no banco e no aparelho. Mesmo se o banco falhar, o token local é apagado. */
export async function logout(): Promise<void> {
    if (modoAutenticacao() === 'firebase') {
        await logoutFirebase();
        return;
    }

    const token = await lerToken();

    try {
        if (token) {
            await encerrarSessao(token);
        }
    } finally {
        await apagarToken();
    }
}
