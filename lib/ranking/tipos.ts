/**
 * Formato do ranking compartilhado pelas duas fontes (SQLite local e
 * Firestore global). Fica fora de db/ para o adaptador da nuvem não depender
 * do banco local.
 */
export type LinhaRanking = {
  /** Id local convertido em texto, ou o uid do Firebase no ranking global. */
  id: string;
  nome: string;
  avatar: string;
  pontos: number;
};

export type PosicaoUsuarioRanking = {
  linha: LinhaRanking;
  /** Posição com empates compartilhados: 1 + quantos têm mais pontos. */
  posicao: number;
  /** Jogador logo acima (o de menor pontuação entre os que têm mais pontos), se houver. */
  acima: LinhaRanking | null;
};

export type ResumoRanking = {
  /** Os mais bem colocados, do maior para o menor número de pontos. */
  lideres: LinhaRanking[];
  /** Total de usuários no ranking. */
  total: number;
  /** Situação do usuário consultado, ou `null` se ele não existir. */
  usuario: PosicaoUsuarioRanking | null;
};

/** Limite máximo de linhas por consulta do ranking. */
export const LIMITE_MAXIMO_RANKING = 100;

/** Normaliza o limite pedido para o intervalo 1..LIMITE_MAXIMO_RANKING. */
export function limiteSeguro(limite: number): number {
  return Math.min(
    LIMITE_MAXIMO_RANKING,
    Math.max(1, Number.isFinite(limite) ? Math.floor(limite) : 1),
  );
}
