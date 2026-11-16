export type Estrelas = 1 | 2 | 3;

export type Desempenho = {
  /** Exercícios acertados na primeira tentativa. */
  acertosDePrimeira: number;
  total: number;
  /** De 0 a 100. */
  precisao: number;
  estrelas: Estrelas;
  /** Pontos desta tentativa, proporcionais aos acertos de primeira. */
  pontos: number;
};

/** A partir desta precisão a lição vale 2 estrelas (3 só sem nenhum erro). */
export const PRECISAO_DUAS_ESTRELAS = 60;

/**
 * Calcula estrelas e pontos de uma lição concluída. Como no Duolingo, o aluno
 * só termina depois de acertar tudo; os erros reduzem estrelas e pontos, mas
 * concluir sempre garante ao menos 1 estrela e 1 ponto.
 */
export function calcularDesempenho(
  total: number,
  acertosDePrimeira: number,
  pontosMaximos: number,
): Desempenho {
  const totalSeguro = Math.max(0, Math.floor(total));
  const acertos = Math.min(totalSeguro, Math.max(0, Math.floor(acertosDePrimeira)));
  const maximo = Math.max(0, Math.floor(pontosMaximos));

  if (totalSeguro === 0) {
    return { acertosDePrimeira: 0, total: 0, precisao: 100, estrelas: 3, pontos: maximo };
  }

  const razao = acertos / totalSeguro;
  const precisao = Math.round(razao * 100);
  const estrelas: Estrelas =
    acertos === totalSeguro ? 3 : precisao >= PRECISAO_DUAS_ESTRELAS ? 2 : 1;
  const pontos = maximo === 0 ? 0 : Math.max(1, Math.round(maximo * razao));

  return { acertosDePrimeira: acertos, total: totalSeguro, precisao, estrelas, pontos };
}
