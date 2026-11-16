import { z } from 'zod';

import { DIFICULDADES, pontosDaDificuldade } from './dificuldade';

/**
 * Modelo dos exercícios da trilha. O conteúdo fica em `data/licoes.ts` e é
 * validado por estes schemas nos testes (inclusive as regras que o TypeScript
 * não consegue expressar, como "toda lacuna precisa de resposta").
 */

/** Marcador de lacuna dentro do código de um exercício de completar. */
export const MARCADOR_LACUNA = '___';

const idSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9-]+$/, 'Use apenas letras minúsculas, números e hífen.');

const textoSchema = z.string().trim().min(1);

function regexValida(fonte: string): boolean {
  try {
    new RegExp(fonte, 'm');
    return true;
  } catch {
    return false;
  }
}

const baseExercicio = {
  id: idSchema,
  enunciado: textoSchema,
  /** Mostrado no painel de feedback, acertando ou errando. */
  explicacao: textoSchema,
};

export const multiplaEscolhaSchema = z
  .object({
    ...baseExercicio,
    tipo: z.literal('multipla-escolha'),
    /** Trecho de pseudocódigo opcional exibido acima das opções. */
    codigo: z.string().min(1).optional(),
    opcoes: z
      .array(z.object({ id: idSchema, texto: textoSchema }))
      .min(2)
      .max(5),
    respostaCorretaId: idSchema,
  })
  .superRefine((exercicio, ctx) => {
    const ids = exercicio.opcoes.map((opcao) => opcao.id);
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({ code: 'custom', message: 'Há opções com id repetido.', path: ['opcoes'] });
    }
    if (!ids.includes(exercicio.respostaCorretaId)) {
      ctx.addIssue({
        code: 'custom',
        message: 'A resposta correta não está entre as opções.',
        path: ['respostaCorretaId'],
      });
    }
  });

export const completarCodigoSchema = z
  .object({
    ...baseExercicio,
    tipo: z.literal('completar-codigo'),
    /** Código com uma ou mais lacunas marcadas por `___`. */
    codigo: textoSchema,
    /** Resposta de cada lacuna, na ordem em que aparecem no código. */
    respostas: z.array(textoSchema).min(1),
    /** Fichas disponíveis para o aluno (respostas + distratores). */
    opcoes: z.array(textoSchema).min(2).max(8),
  })
  .superRefine((exercicio, ctx) => {
    const lacunas = exercicio.codigo.split(MARCADOR_LACUNA).length - 1;
    if (lacunas !== exercicio.respostas.length) {
      ctx.addIssue({
        code: 'custom',
        message: `O código tem ${lacunas} lacuna(s), mas há ${exercicio.respostas.length} resposta(s).`,
        path: ['respostas'],
      });
    }

    // Cada resposta precisa existir no banco de fichas tantas vezes quanto é usada.
    const disponiveis = [...exercicio.opcoes];
    for (const resposta of exercicio.respostas) {
      const indice = disponiveis.indexOf(resposta);
      if (indice === -1) {
        ctx.addIssue({
          code: 'custom',
          message: `A resposta "${resposta}" não está entre as fichas.`,
          path: ['opcoes'],
        });
      } else {
        disponiveis.splice(indice, 1);
      }
    }
  });

export const ordenarLinhasSchema = z
  .object({
    ...baseExercicio,
    tipo: z.literal('ordenar-linhas'),
    /** Linhas na ordem correta. A tela embaralha antes de exibir. */
    linhas: z
      .array(
        z.object({
          id: idSchema,
          texto: textoSchema,
          /** Nível de recuo (0 a 4) usado só na exibição da resposta. */
          recuo: z.number().int().min(0).max(4).default(0),
        }),
      )
      .min(3)
      .max(9),
    /** Outras ordens também corretas (ids), ex.: duas leituras que podem trocar de lugar. */
    ordensAlternativas: z.array(z.array(idSchema)).default([]),
  })
  .superRefine((exercicio, ctx) => {
    const ids = exercicio.linhas.map((linha) => linha.id);
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({ code: 'custom', message: 'Há linhas com id repetido.', path: ['linhas'] });
    }
    const textos = exercicio.linhas.map((linha) => linha.texto);
    if (new Set(textos).size !== textos.length) {
      // Linhas iguais seriam indistinguíveis para o aluno.
      ctx.addIssue({ code: 'custom', message: 'Há linhas com texto repetido.', path: ['linhas'] });
    }
    const ordenados = [...ids].sort().join('|');
    exercicio.ordensAlternativas.forEach((ordem, indice) => {
      if ([...ordem].sort().join('|') !== ordenados) {
        ctx.addIssue({
          code: 'custom',
          message: 'Uma ordem alternativa precisa usar exatamente as mesmas linhas.',
          path: ['ordensAlternativas', indice],
        });
      }
    });
  });

export const requisitoPseudocodigoSchema = z.object({
  id: idSchema,
  /** Texto mostrado ao aluno no checklist do feedback. */
  descricao: textoSchema,
  /**
   * Expressão regular aplicada ao texto normalizado (minúsculo, sem acentos,
   * `←` convertido em `<-`). Compilada com a flag `m`.
   */
  padrao: z.string().min(1).refine(regexValida, 'Expressão regular inválida.'),
  /** Id de outro requisito que precisa aparecer antes deste no texto. */
  depoisDe: idSchema.optional(),
});

export const escreverPseudocodigoSchema = z
  .object({
    ...baseExercicio,
    tipo: z.literal('escrever-pseudocodigo'),
    /** Palavras-chave sugeridas como atalho acima do campo de texto. */
    palavrasChave: z.array(textoSchema).max(8).default([]),
    requisitos: z.array(requisitoPseudocodigoSchema).min(1).max(8),
    /** Uma solução aceita, exibida depois da verificação. */
    solucaoExemplo: textoSchema,
  })
  .superRefine((exercicio, ctx) => {
    const ids = exercicio.requisitos.map((requisito) => requisito.id);
    exercicio.requisitos.forEach((requisito, indice) => {
      if (!requisito.depoisDe) return;
      const anterior = ids.indexOf(requisito.depoisDe);
      if (anterior === -1 || anterior >= indice) {
        ctx.addIssue({
          code: 'custom',
          message: '`depoisDe` precisa apontar para um requisito declarado antes.',
          path: ['requisitos', indice, 'depoisDe'],
        });
      }
    });
  });

export const exercicioSchema = z.discriminatedUnion('tipo', [
  multiplaEscolhaSchema,
  completarCodigoSchema,
  ordenarLinhasSchema,
  escreverPseudocodigoSchema,
]);

const icones = ['arrow-forward', 'cube', 'git-branch', 'repeat', 'construct'] as const;

export const licaoSchema = z
  .object({
    id: idSchema,
    titulo: textoSchema,
    descricao: textoSchema,
    icone: z.enum(icones),
    dificuldade: z.enum(DIFICULDADES),
    moedas: z.number().int().min(0),
    exercicios: z.array(exercicioSchema).min(1),
  })
  .superRefine((licao, ctx) => {
    const ids = licao.exercicios.map((exercicio) => exercicio.id);
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'Há exercícios com id repetido.',
        path: ['exercicios'],
      });
    }
  })
  // A pontuação vem da dificuldade, para não haver duas fontes que possam divergir.
  .transform((licao) => ({ ...licao, pontos: pontosDaDificuldade(licao.dificuldade) }));

export const trilhaSchema = z.array(licaoSchema).min(1);

export type ExercicioMultiplaEscolha = z.infer<typeof multiplaEscolhaSchema>;
export type ExercicioCompletarCodigo = z.infer<typeof completarCodigoSchema>;
export type ExercicioOrdenarLinhas = z.infer<typeof ordenarLinhasSchema>;
export type ExercicioPseudocodigo = z.infer<typeof escreverPseudocodigoSchema>;
export type RequisitoPseudocodigo = z.infer<typeof requisitoPseudocodigoSchema>;
export type Exercicio = z.infer<typeof exercicioSchema>;
export type TipoExercicio = Exercicio['tipo'];
export type Licao = z.infer<typeof licaoSchema>;
/** Formato aceito na escrita do conteúdo (campos com `default` são opcionais). */
export type LicaoEntrada = z.input<typeof licaoSchema>;

/** Parâmetro de rota `id` da tela da lição. */
export const idLicaoParamSchema = z.preprocess(
  (valor) => (Array.isArray(valor) ? valor[0] : valor),
  idSchema,
);
