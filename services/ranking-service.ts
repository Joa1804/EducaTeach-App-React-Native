import { buscarRanking, type ResumoRanking, type Usuario } from '../db/database';
import { firebaseHabilitado, getFirestoreDb } from '../db/firebase';
import { buscarRankingGlobal } from './firebase/ranking-global';
import { sincronizarUsuario } from './sync';

export type FonteRanking = 'global' | 'local';

export type RankingCarregado = {
  resumo: ResumoRanking;
  fonte: FonteRanking;
  /** Id que identifica o usuário atual nas linhas do resumo. */
  chaveUsuario: string | null;
  /** Preenchido quando o global falhou e o app caiu para o ranking do aparelho. */
  aviso: string | null;
};

type UsuarioRanking = Pick<Usuario, 'id' | 'nome' | 'firebase_uid'>;

/**
 * Explica por que o ranking global não carregou. Só falta de rede vira "sem
 * conexão"; erros de configuração do Firebase recebem uma mensagem própria,
 * para não esconder um problema que precisa de ação no console.
 */
export function avisoDeFalhaGlobal(error: unknown): string {
  const codigo =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : '';

  switch (codigo) {
    case 'permission-denied':
      return 'Ranking global bloqueado pelas regras do Firestore (publique o firestore.rules). Mostrando o ranking deste aparelho.';
    case 'failed-precondition':
      return 'Ranking global aguardando a criação dos índices no Firebase. Mostrando o ranking deste aparelho.';
    case 'unavailable':
    case 'deadline-exceeded':
      return 'Sem conexão: mostrando o ranking deste aparelho.';
    default:
      return 'Ranking global indisponível agora: mostrando o ranking deste aparelho.';
  }
}

/**
 * Carrega o ranking global (Firestore) para contas Firebase, enviando antes o
 * progresso pendente para que os pontos mais recentes já apareçam. Sem
 * Firebase, ou sem internet, usa o ranking dos usuários deste aparelho.
 */
export async function carregarRanking(
  usuario: UsuarioRanking | null,
  limite: number,
): Promise<RankingCarregado> {
  const uid = usuario?.firebase_uid ?? null;

  if (usuario && uid && firebaseHabilitado()) {
    try {
      await sincronizarUsuario(usuario).catch((error: unknown) => {
        // Mesmo sem enviar agora, o ranking global ainda pode ser lido.
        console.warn('Progresso não sincronizado antes do ranking:', error);
      });

      const resumo = await buscarRankingGlobal(getFirestoreDb(), uid, limite);
      return { resumo, fonte: 'global', chaveUsuario: uid, aviso: null };
    } catch (error: unknown) {
      console.warn('Ranking global indisponível, usando o do aparelho:', error);
      const resumo = await buscarRanking(usuario.id, limite);
      return {
        resumo,
        fonte: 'local',
        chaveUsuario: String(usuario.id),
        aviso: avisoDeFalhaGlobal(error),
      };
    }
  }

  const resumo = await buscarRanking(usuario?.id ?? null, limite);
  return {
    resumo,
    fonte: 'local',
    chaveUsuario: usuario ? String(usuario.id) : null,
    aviso: null,
  };
}
