import {
  DIFICULDADES,
  PONTOS_POR_DIFICULDADE,
  ROTULO_DIFICULDADE,
  pontosDaDificuldade,
} from '../dificuldade';
import { licaoSchema } from '../schemas';

const BASE = {
  id: 'teste',
  titulo: 'Teste',
  descricao: 'Lição de teste',
  icone: 'cube',
  moedas: 1,
  exercicios: [
    {
      id: 'e1',
      tipo: 'multipla-escolha',
      enunciado: 'Qual?',
      opcoes: [
        { id: 'a', texto: 'A' },
        { id: 'b', texto: 'B' },
      ],
      respostaCorretaId: 'a',
      explicacao: '...',
    },
  ],
} as const;

describe('dificuldade', () => {
  it('fácil vale 50, média 100 e difícil 150 pontos', () => {
    expect(PONTOS_POR_DIFICULDADE).toEqual({ facil: 50, medio: 100, dificil: 150 });
    expect(DIFICULDADES.map(pontosDaDificuldade)).toEqual([50, 100, 150]);
  });

  it('tem rótulo para cada nível', () => {
    expect(DIFICULDADES.map((d) => ROTULO_DIFICULDADE[d])).toEqual(['Fácil', 'Média', 'Difícil']);
  });

  it.each(DIFICULDADES)('o schema deriva os pontos da dificuldade "%s"', (dificuldade) => {
    const licao = licaoSchema.parse({ ...BASE, dificuldade });
    expect(licao.pontos).toBe(PONTOS_POR_DIFICULDADE[dificuldade]);
  });

  it('ignora uma pontuação escrita à mão no conteúdo', () => {
    const licao = licaoSchema.parse({ ...BASE, dificuldade: 'dificil', pontos: 9999 });
    expect(licao.pontos).toBe(150);
  });

  it('rejeita dificuldade desconhecida', () => {
    expect(licaoSchema.safeParse({ ...BASE, dificuldade: 'extrema' }).success).toBe(false);
  });
});
