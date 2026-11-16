import {
  completarCodigoSchema,
  escreverPseudocodigoSchema,
  idLicaoParamSchema,
  multiplaEscolhaSchema,
  ordenarLinhasSchema,
} from '../schemas';

const base = { enunciado: 'Enunciado', explicacao: 'Explicação' };

describe('schemas de exercício', () => {
  it('recusa múltipla escolha cuja resposta não está nas opções', () => {
    const resultado = multiplaEscolhaSchema.safeParse({
      ...base,
      id: 'x',
      tipo: 'multipla-escolha',
      opcoes: [
        { id: 'a', texto: 'A' },
        { id: 'b', texto: 'B' },
      ],
      respostaCorretaId: 'z',
    });
    expect(resultado.success).toBe(false);
  });

  it('recusa completar código com número de lacunas diferente das respostas', () => {
    const resultado = completarCodigoSchema.safeParse({
      ...base,
      id: 'x',
      tipo: 'completar-codigo',
      codigo: '___ x ___',
      respostas: ['leia'],
      opcoes: ['leia', 'escreva'],
    });
    expect(resultado.success).toBe(false);
  });

  it('recusa completar código quando a resposta não está entre as fichas', () => {
    const resultado = completarCodigoSchema.safeParse({
      ...base,
      id: 'x',
      tipo: 'completar-codigo',
      codigo: '___ x ___',
      respostas: ['leia', 'leia'],
      opcoes: ['leia', 'escreva'],
    });
    expect(resultado.success).toBe(false);
  });

  it('recusa ordem alternativa com linhas diferentes', () => {
    const resultado = ordenarLinhasSchema.safeParse({
      ...base,
      id: 'x',
      tipo: 'ordenar-linhas',
      linhas: [
        { id: 'l1', texto: 'a' },
        { id: 'l2', texto: 'b' },
        { id: 'l3', texto: 'c' },
      ],
      ordensAlternativas: [['l1', 'l2']],
    });
    expect(resultado.success).toBe(false);
  });

  it('aplica padrões de recuo e ordens alternativas', () => {
    const exercicio = ordenarLinhasSchema.parse({
      ...base,
      id: 'x',
      tipo: 'ordenar-linhas',
      linhas: [
        { id: 'l1', texto: 'a' },
        { id: 'l2', texto: 'b' },
        { id: 'l3', texto: 'c' },
      ],
    });
    expect(exercicio.linhas[0].recuo).toBe(0);
    expect(exercicio.ordensAlternativas).toEqual([]);
  });

  it('recusa regex inválida e depoisDe apontando para requisito posterior', () => {
    const comum = {
      ...base,
      id: 'x',
      tipo: 'escrever-pseudocodigo',
      solucaoExemplo: 'leia x',
    };
    expect(
      escreverPseudocodigoSchema.safeParse({
        ...comum,
        requisitos: [{ id: 'r1', descricao: 'R1', padrao: '(' }],
      }).success,
    ).toBe(false);
    expect(
      escreverPseudocodigoSchema.safeParse({
        ...comum,
        requisitos: [
          { id: 'r1', descricao: 'R1', padrao: 'a', depoisDe: 'r2' },
          { id: 'r2', descricao: 'R2', padrao: 'b' },
        ],
      }).success,
    ).toBe(false);
  });
});

describe('idLicaoParamSchema', () => {
  it.each([
    ['condicionais', 'condicionais'],
    [['funcoes', 'outro'], 'funcoes'],
  ])('aceita %j', (entrada, esperado) => {
    expect(idLicaoParamSchema.parse(entrada)).toBe(esperado);
  });

  it.each([undefined, '', 'Condicionais', '../etc', 'a'.repeat(65), 42])('recusa %j', (entrada) => {
    expect(idLicaoParamSchema.safeParse(entrada).success).toBe(false);
  });
});
