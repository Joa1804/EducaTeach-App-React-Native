/** Gerador de números em [0, 1). Injetável para testes determinísticos. */
export type Aleatorio = () => number;

/** Fisher–Yates: devolve uma cópia embaralhada, sem alterar o array original. */
export function embaralhar<T>(itens: readonly T[], aleatorio: Aleatorio = Math.random): T[] {
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Embaralha garantindo que o resultado não seja nenhuma das ordens proibidas
 * (ex.: a própria resposta correta). Com menos de 2 itens não há o que embaralhar.
 */
export function embaralharDiferente<T>(
  itens: readonly T[],
  proibidas: readonly (readonly T[])[],
  aleatorio: Aleatorio = Math.random,
): T[] {
  const igual = (a: readonly T[], b: readonly T[]) =>
    a.length === b.length && a.every((valor, indice) => valor === b[indice]);

  if (itens.length < 2) return [...itens];

  for (let tentativa = 0; tentativa < 20; tentativa += 1) {
    const candidato = embaralhar(itens, aleatorio);
    if (!proibidas.some((ordem) => igual(ordem, candidato))) return candidato;
  }

  // Fallback determinístico: rotaciona uma posição (sempre difere da ordem original).
  const rotacionado = [...itens.slice(1), itens[0]];
  return rotacionado;
}
