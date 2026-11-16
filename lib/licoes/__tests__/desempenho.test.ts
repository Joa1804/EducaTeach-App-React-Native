import { calcularDesempenho } from '../desempenho';

describe('calcularDesempenho', () => {
  it('dá 3 estrelas e pontuação máxima sem erros', () => {
    expect(calcularDesempenho(5, 5, 20)).toEqual({
      acertosDePrimeira: 5,
      total: 5,
      precisao: 100,
      estrelas: 3,
      pontos: 20,
    });
  });

  it('dá 2 estrelas a partir de 60% de acertos de primeira', () => {
    expect(calcularDesempenho(5, 3, 20)).toMatchObject({ precisao: 60, estrelas: 2, pontos: 12 });
    expect(calcularDesempenho(5, 4, 20)).toMatchObject({ estrelas: 2, pontos: 16 });
  });

  it('dá 1 estrela abaixo de 60%, mas garante ao menos 1 ponto', () => {
    expect(calcularDesempenho(5, 2, 20)).toMatchObject({ estrelas: 1, pontos: 8 });
    expect(calcularDesempenho(5, 0, 20)).toMatchObject({ estrelas: 1, pontos: 1, precisao: 0 });
  });

  it('limita entradas inválidas', () => {
    expect(calcularDesempenho(4, 9, 10)).toMatchObject({ acertosDePrimeira: 4, estrelas: 3 });
    expect(calcularDesempenho(4, -1, 10)).toMatchObject({ acertosDePrimeira: 0 });
    expect(calcularDesempenho(0, 0, 10)).toMatchObject({ estrelas: 3, pontos: 10 });
    expect(calcularDesempenho(3, 1, 0)).toMatchObject({ pontos: 0 });
  });
});
