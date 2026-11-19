// Utilitários de cor para os componentes de interface.
// Trabalham com cores no formato '#RRGGBB' (ou '#RGB').

function hexParaRgb(hex: string): [number, number, number] {
  const limpo = hex.replace('#', '');
  const completo = limpo.length === 3 ? limpo.split('').map((c) => c + c).join('') : limpo;
  const numero = parseInt(completo.slice(0, 6), 16);
  return [(numero >> 16) & 255, (numero >> 8) & 255, numero & 255];
}

/** Devolve uma versão mais escura da cor. Usada na "base" dos botões 3D. quantidade: 0 a 1. */
export function escurecer(hex: string, quantidade = 0.25): string {
  const [r, g, b] = hexParaRgb(hex);
  const canal = (valor: number) =>
    Math.round(valor * (1 - quantidade)).toString(16).padStart(2, '0');
  return `#${canal(r)}${canal(g)}${canal(b)}`;
}

/** Escolhe preto ou branco para o texto ficar legível sobre a cor de fundo informada. */
export function corDoTexto(fundo: string): '#000000' | '#FFFFFF' {
  const [r, g, b] = hexParaRgb(fundo);
  const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminancia > 0.6 ? '#000000' : '#FFFFFF';
}

/** A mesma cor com transparência (alfa de 0 a 1). Usada em fundos suaves de etiquetas e barras. */
export function comAlfa(hex: string, alfa: number): string {
  const [r, g, b] = hexParaRgb(hex);
  return `rgba(${r},${g},${b},${alfa})`;
}