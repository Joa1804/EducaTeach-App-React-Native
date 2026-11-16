import { MARCADOR_LACUNA } from './schemas';

export type SegmentoCodigo = { tipo: 'texto'; valor: string } | { tipo: 'lacuna'; indice: number };

/**
 * Quebra um código com lacunas em linhas e segmentos, numerando as lacunas na
 * ordem em que aparecem (a mesma ordem das respostas do exercício).
 */
export function dividirEmSegmentos(codigo: string): SegmentoCodigo[][] {
  let proximaLacuna = 0;

  return codigo.split('\n').map((linha) => {
    const partes = linha.split(MARCADOR_LACUNA);
    return partes.flatMap<SegmentoCodigo>((parte, indice) => {
      const segmentos: SegmentoCodigo[] = [];
      if (indice > 0) {
        segmentos.push({ tipo: 'lacuna', indice: proximaLacuna });
        proximaLacuna += 1;
      }
      if (parte.length > 0) segmentos.push({ tipo: 'texto', valor: parte });
      return segmentos;
    });
  });
}
