import type { LinhaRanking, ResumoRanking } from '../../../db/database';
import { atribuirPosicoes, formatarPontos, montarRanking } from '../ranking';

function linha(id: number, nome: string, pontos: number): LinhaRanking {
  return { id, nome, pontos, avatar: 'padrao' };
}

describe('atribuirPosicoes', () => {
  it('numera em ordem e marca o usuário atual', () => {
    const itens = atribuirPosicoes([linha(1, 'Ana', 300), linha(2, 'Bia', 200)], 2);
    expect(itens.map((item) => [item.nome, item.posicao, item.voce])).toEqual([
      ['Ana', 1, false],
      ['Bia', 2, true],
    ]);
  });

  it('empatados dividem a posição e a próxima é pulada', () => {
    const itens = atribuirPosicoes(
      [linha(1, 'Ana', 300), linha(2, 'Bia', 200), linha(3, 'Caio', 200), linha(4, 'Davi', 50)],
      null,
    );
    expect(itens.map((item) => item.posicao)).toEqual([1, 2, 2, 4]);
  });

  it('lista vazia continua vazia', () => {
    expect(atribuirPosicoes([], 1)).toEqual([]);
  });
});

describe('montarRanking', () => {
  const lideres = [linha(1, 'Ana', 300), linha(2, 'Bia', 200), linha(3, 'Caio', 150)];

  it('calcula quanto falta para passar quem está logo acima', () => {
    const resumo: ResumoRanking = {
      lideres,
      total: 3,
      usuario: { linha: lideres[2], posicao: 3, acima: lideres[1] },
    };

    const { itens, usuario } = montarRanking(resumo, 3);

    expect(itens).toHaveLength(3);
    expect(itens[2]).toMatchObject({ voce: true, foraDosLideres: false });
    expect(usuario).toEqual({
      posicao: 3,
      total: 3,
      pontos: 150,
      alvo: { nome: 'Bia', pontos: 200 },
      pontosParaSubir: 51,
      progresso: 150 / 201,
    });
  });

  it('acrescenta o usuário no fim quando ele está fora dos líderes', () => {
    const eu = linha(9, 'Zeca', 0);
    const resumo: ResumoRanking = {
      lideres,
      total: 20,
      usuario: { linha: eu, posicao: 20, acima: linha(8, 'Yara', 50) },
    };

    const { itens, usuario } = montarRanking(resumo, 9);

    expect(itens.at(-1)).toMatchObject({
      id: 9,
      posicao: 20,
      voce: true,
      foraDosLideres: true,
    });
    expect(itens.filter((item) => item.voce)).toHaveLength(1);
    expect(usuario).toMatchObject({ pontosParaSubir: 51, progresso: 0 });
  });

  it('o líder não tem alvo e a barra fica cheia', () => {
    const resumo: ResumoRanking = {
      lideres,
      total: 3,
      usuario: { linha: lideres[0], posicao: 1, acima: null },
    };

    expect(montarRanking(resumo, 1).usuario).toMatchObject({
      alvo: null,
      pontosParaSubir: 0,
      progresso: 1,
    });
  });

  it('sem usuário consultado só mostra os líderes', () => {
    const { itens, usuario } = montarRanking({ lideres, total: 3, usuario: null }, null);
    expect(usuario).toBeNull();
    expect(itens.some((item) => item.voce)).toBe(false);
  });

  it('nunca mostra posição maior que o total', () => {
    const resumo: ResumoRanking = {
      lideres: [],
      total: 0,
      usuario: { linha: linha(1, 'Ana', 0), posicao: 1, acima: null },
    };
    expect(montarRanking(resumo, 1).usuario).toMatchObject({ posicao: 1, total: 1 });
  });
});

describe('formatarPontos', () => {
  it.each([
    [0, '0'],
    [950, '950'],
    [1250, '1.250'],
    [1234567, '1.234.567'],
    [-5, '0'],
    [99.6, '100'],
  ])('%p vira %p', (valor, esperado) => {
    expect(formatarPontos(valor)).toBe(esperado);
  });
});
