/**
 * Níveis de dificuldade das lições e quanto cada um vale no ranking.
 * Esta é a única fonte da pontuação: o conteúdo em `data/licoes.ts` declara só
 * a dificuldade, e o schema deriva os pontos daqui.
 */
export const DIFICULDADES = ['facil', 'medio', 'dificil'] as const;

export type Dificuldade = (typeof DIFICULDADES)[number];

/** Pontuação máxima de uma lição, obtida quando o aluno acerta tudo de primeira. */
export const PONTOS_POR_DIFICULDADE: Readonly<Record<Dificuldade, number>> = {
  facil: 50,
  medio: 100,
  dificil: 150,
};

export const ROTULO_DIFICULDADE: Readonly<Record<Dificuldade, string>> = {
  facil: 'Fácil',
  medio: 'Média',
  dificil: 'Difícil',
};

export function pontosDaDificuldade(dificuldade: Dificuldade): number {
  return PONTOS_POR_DIFICULDADE[dificuldade];
}
