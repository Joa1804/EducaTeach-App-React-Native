import type { LinhaRanking, ResumoRanking } from '../../db/database';

export type ItemRanking = LinhaRanking & {
  /** Posição com empates compartilhados (1, 2, 2, 4...). */
  posicao: number;
  voce: boolean;
  /**
   * Verdadeiro quando o usuário atual está fora dos líderes e a linha dele foi
   * acrescentada ao fim da lista, separada do resto.
   */
  foraDosLideres: boolean;
};

export type SituacaoUsuario = {
  posicao: number;
  total: number;
  pontos: number;
  /** Quem o usuário precisa ultrapassar para subir, ou `null` se já lidera. */
  alvo: { nome: string; pontos: number } | null;
  /** Pontos que faltam para passar o alvo (0 quando lidera). */
  pontosParaSubir: number;
  /** De 0 a 1: quanto do caminho até passar o alvo já foi feito. */
  progresso: number;
};

export type Ranking = {
  itens: ItemRanking[];
  usuario: SituacaoUsuario | null;
};

/**
 * Atribui posições a uma lista já ordenada do maior para o menor número de
 * pontos. Empatados dividem a posição e a seguinte é pulada, como no esporte.
 */
export function atribuirPosicoes(
  linhas: readonly LinhaRanking[],
  usuarioId: number | null,
): ItemRanking[] {
  let posicaoAtual = 0;
  let pontosAnteriores: number | null = null;

  return linhas.map((linha, indice) => {
    if (pontosAnteriores === null || linha.pontos < pontosAnteriores) {
      posicaoAtual = indice + 1;
      pontosAnteriores = linha.pontos;
    }

    return {
      ...linha,
      posicao: posicaoAtual,
      voce: linha.id === usuarioId,
      foraDosLideres: false,
    };
  });
}

/** Transforma o resumo do banco no que a tela de ranking exibe. */
export function montarRanking(resumo: ResumoRanking, usuarioId: number | null): Ranking {
  const itens = atribuirPosicoes(resumo.lideres, usuarioId);
  const situacao = resumo.usuario;

  if (!situacao) {
    return { itens, usuario: null };
  }

  if (!itens.some((item) => item.voce)) {
    itens.push({
      ...situacao.linha,
      posicao: situacao.posicao,
      voce: true,
      foraDosLideres: true,
    });
  }

  const { pontos } = situacao.linha;
  const alvo = situacao.acima;
  // Para passar alguém é preciso ter um ponto a mais do que ele.
  const meta = alvo ? alvo.pontos + 1 : 0;

  return {
    itens,
    usuario: {
      posicao: situacao.posicao,
      // Garante coerência mesmo se o total vier de uma leitura anterior.
      total: Math.max(resumo.total, situacao.posicao),
      pontos,
      alvo: alvo ? { nome: alvo.nome, pontos: alvo.pontos } : null,
      pontosParaSubir: alvo ? meta - pontos : 0,
      progresso: alvo ? Math.min(1, Math.max(0, pontos / meta)) : 1,
    },
  };
}

/** Formata pontos com separador de milhar (1.250). */
export function formatarPontos(pontos: number): string {
  return Math.max(0, Math.round(pontos))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
