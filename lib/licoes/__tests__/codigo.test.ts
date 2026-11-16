import { dividirEmSegmentos } from '../codigo';

describe('dividirEmSegmentos', () => {
  it('numera as lacunas em ordem através das linhas', () => {
    expect(dividirEmSegmentos('se x ___ 1 entao\n  ___\nfimse')).toEqual([
      [
        { tipo: 'texto', valor: 'se x ' },
        { tipo: 'lacuna', indice: 0 },
        { tipo: 'texto', valor: ' 1 entao' },
      ],
      [
        { tipo: 'texto', valor: '  ' },
        { tipo: 'lacuna', indice: 1 },
      ],
      [{ tipo: 'texto', valor: 'fimse' }],
    ]);
  });

  it('mantém linhas vazias como linhas sem segmentos', () => {
    expect(dividirEmSegmentos('a\n\nb')).toEqual([
      [{ tipo: 'texto', valor: 'a' }],
      [],
      [{ tipo: 'texto', valor: 'b' }],
    ]);
  });
});
