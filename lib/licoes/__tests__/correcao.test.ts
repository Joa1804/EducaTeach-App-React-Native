import { corrigirExercicio, normalizarTexto, preencherCodigo, respostaCompleta } from '../correcao';
import {
  completarCodigoSchema,
  escreverPseudocodigoSchema,
  multiplaEscolhaSchema,
  ordenarLinhasSchema,
} from '../schemas';

const MULTIPLA = multiplaEscolhaSchema.parse({
  id: 'm1',
  tipo: 'multipla-escolha',
  enunciado: 'Quanto é 1 + 1?',
  opcoes: [
    { id: 'a', texto: '1' },
    { id: 'b', texto: '2' },
  ],
  respostaCorretaId: 'b',
  explicacao: 'Soma simples.',
});

const COMPLETAR = completarCodigoSchema.parse({
  id: 'c1',
  tipo: 'completar-codigo',
  enunciado: 'Complete',
  codigo: '___ "Oi"\n___ nome',
  respostas: ['escreva', 'leia'],
  opcoes: ['leia', 'escreva', 'se'],
  explicacao: '...',
});

const ORDENAR = ordenarLinhasSchema.parse({
  id: 'o1',
  tipo: 'ordenar-linhas',
  enunciado: 'Ordene',
  linhas: [
    { id: 'l1', texto: 'leia a' },
    { id: 'l2', texto: 'leia b' },
    { id: 'l3', texto: 'escreva a + b', recuo: 1 },
  ],
  ordensAlternativas: [['l2', 'l1', 'l3']],
  explicacao: '...',
});

const PSEUDO = escreverPseudocodigoSchema.parse({
  id: 'p1',
  tipo: 'escrever-pseudocodigo',
  enunciado: 'Leia temp e diga se está quente',
  requisitos: [
    { id: 'ler', descricao: 'Ler temp', padrao: String.raw`\bleia\s*\(?\s*temp\b` },
    {
      id: 'se',
      descricao: 'Testar temp > 30',
      padrao: String.raw`\bse\b[^\n]*\btemp\s*>\s*30\b`,
      depoisDe: 'ler',
    },
    {
      id: 'senao',
      descricao: 'Usar senao',
      padrao: String.raw`\bsenao\b`,
      depoisDe: 'se',
    },
  ],
  solucaoExemplo: 'leia temp\nse temp > 30 entao\n  escreva "Calor"\nsenao\n  escreva "Ok"\nfimse',
  explicacao: '...',
});

describe('normalizarTexto', () => {
  it('remove acentos, padroniza caixa, aspas, setas e espaços', () => {
    expect(normalizarTexto('  SENÃO   “Olá”\r\n  x ← 1  \n y := 2 ')).toBe(
      'senao "ola"\nx <- 1\ny <- 2',
    );
  });
});

describe('preencherCodigo', () => {
  it('substitui as lacunas na ordem e mantém as vazias', () => {
    expect(preencherCodigo('a ___ b ___', ['1', null])).toBe('a 1 b ___');
  });
});

describe('corrigirExercicio', () => {
  describe('múltipla escolha', () => {
    it('aceita a opção correta e informa o texto dela', () => {
      expect(corrigirExercicio(MULTIPLA, { tipo: 'multipla-escolha', opcaoId: 'b' })).toEqual({
        correta: true,
        respostaEsperada: '2',
      });
    });

    it('recusa outra opção', () => {
      expect(corrigirExercicio(MULTIPLA, { tipo: 'multipla-escolha', opcaoId: 'a' }).correta).toBe(
        false,
      );
    });
  });

  describe('completar código', () => {
    it('aceita as fichas certas ignorando espaços extras', () => {
      const resultado = corrigirExercicio(COMPLETAR, {
        tipo: 'completar-codigo',
        preenchimento: [' escreva ', 'leia'],
      });
      expect(resultado.correta).toBe(true);
      expect(resultado.lacunasErradas).toEqual([]);
    });

    it('aponta quais lacunas estão erradas ou vazias', () => {
      const resultado = corrigirExercicio(COMPLETAR, {
        tipo: 'completar-codigo',
        preenchimento: ['leia', null],
      });
      expect(resultado.correta).toBe(false);
      expect(resultado.lacunasErradas).toEqual([0, 1]);
      expect(resultado.respostaEsperada).toBe('escreva "Oi"\nleia nome');
    });

    it('trata preenchimento mais curto que o número de lacunas como erro', () => {
      expect(
        corrigirExercicio(COMPLETAR, { tipo: 'completar-codigo', preenchimento: ['escreva'] })
          .lacunasErradas,
      ).toEqual([1]);
    });
  });

  describe('ordenar linhas', () => {
    it('aceita a ordem principal', () => {
      expect(
        corrigirExercicio(ORDENAR, { tipo: 'ordenar-linhas', ordem: ['l1', 'l2', 'l3'] }).correta,
      ).toBe(true);
    });

    it('aceita uma ordem alternativa declarada', () => {
      expect(
        corrigirExercicio(ORDENAR, { tipo: 'ordenar-linhas', ordem: ['l2', 'l1', 'l3'] }).correta,
      ).toBe(true);
    });

    it('recusa ordem errada ou incompleta', () => {
      expect(
        corrigirExercicio(ORDENAR, { tipo: 'ordenar-linhas', ordem: ['l3', 'l1', 'l2'] }).correta,
      ).toBe(false);
      expect(
        corrigirExercicio(ORDENAR, { tipo: 'ordenar-linhas', ordem: ['l1', 'l2'] }).correta,
      ).toBe(false);
    });

    it('mostra a resposta esperada com recuo', () => {
      expect(
        corrigirExercicio(ORDENAR, { tipo: 'ordenar-linhas', ordem: [] }).respostaEsperada,
      ).toBe('leia a\nleia b\n  escreva a + b');
    });
  });

  describe('escrever pseudocódigo', () => {
    const corrigir = (texto: string) =>
      corrigirExercicio(PSEUDO, { tipo: 'escrever-pseudocodigo', texto });

    it('aceita a solução de exemplo', () => {
      expect(corrigir(PSEUDO.solucaoExemplo).correta).toBe(true);
    });

    it('aceita variações de caixa, acento, parênteses e espaços', () => {
      const resultado = corrigir(
        'LEIA(temp)\nSe temp>30 então\n  Escreva "Calor"\nSENÃO\n  escreva "ok"',
      );
      expect(resultado.correta).toBe(true);
      expect(resultado.requisitos?.every((requisito) => requisito.atendido)).toBe(true);
    });

    it('marca no checklist o requisito que faltou', () => {
      const resultado = corrigir('leia temp\nse temp > 30 entao\n  escreva "Calor"\nfimse');
      expect(resultado.correta).toBe(false);
      expect(resultado.requisitos).toEqual([
        { id: 'ler', descricao: 'Ler temp', atendido: true },
        { id: 'se', descricao: 'Testar temp > 30', atendido: true },
        { id: 'senao', descricao: 'Usar senao', atendido: false },
      ]);
    });

    it('exige a ordem declarada em depoisDe', () => {
      const resultado = corrigir('se temp > 30 entao\n  escreva "Calor"\nfimse\nleia temp');
      expect(resultado.correta).toBe(false);
      expect(resultado.requisitos?.find((requisito) => requisito.id === 'se')?.atendido).toBe(
        false,
      );
    });

    it('ignora comentários', () => {
      expect(corrigir('// leia temp\n// se temp > 30 entao senao').correta).toBe(false);
    });

    it('recusa texto vazio ou curto demais', () => {
      expect(corrigir('').correta).toBe(false);
      expect(corrigir('senao').requisitos?.some((requisito) => requisito.atendido)).toBe(false);
    });
  });

  it('considera errada uma resposta de outro tipo', () => {
    expect(corrigirExercicio(MULTIPLA, { tipo: 'ordenar-linhas', ordem: [] }).correta).toBe(false);
    expect(corrigirExercicio(PSEUDO, { tipo: 'multipla-escolha', opcaoId: 'a' }).correta).toBe(
      false,
    );
  });
});

describe('respostaCompleta', () => {
  it('exige todas as lacunas preenchidas', () => {
    expect(
      respostaCompleta(COMPLETAR, { tipo: 'completar-codigo', preenchimento: ['leia', null] }),
    ).toBe(false);
    expect(
      respostaCompleta(COMPLETAR, { tipo: 'completar-codigo', preenchimento: ['leia', 'se'] }),
    ).toBe(true);
  });

  it('exige todas as linhas posicionadas', () => {
    expect(respostaCompleta(ORDENAR, { tipo: 'ordenar-linhas', ordem: ['l1'] })).toBe(false);
    expect(respostaCompleta(ORDENAR, { tipo: 'ordenar-linhas', ordem: ['l1', 'l3', 'l2'] })).toBe(
      true,
    );
  });

  it('exige um pseudocódigo com tamanho mínimo', () => {
    expect(respostaCompleta(PSEUDO, { tipo: 'escrever-pseudocodigo', texto: '   leia   ' })).toBe(
      false,
    );
    expect(
      respostaCompleta(PSEUDO, { tipo: 'escrever-pseudocodigo', texto: 'leia temp\nfim' }),
    ).toBe(true);
  });

  it('recusa resposta nula ou de outro tipo', () => {
    expect(respostaCompleta(MULTIPLA, null)).toBe(false);
    expect(respostaCompleta(MULTIPLA, { tipo: 'ordenar-linhas', ordem: [] })).toBe(false);
    expect(respostaCompleta(MULTIPLA, { tipo: 'multipla-escolha', opcaoId: 'a' })).toBe(true);
  });
});
