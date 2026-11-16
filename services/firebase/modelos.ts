import {
  Timestamp,
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
} from 'firebase/firestore';
import { z } from 'zod';

/**
 * Modelo de dados no Firestore (desenhado a partir das leituras do app):
 *
 * - `ranking/{uid}`: { nome, pontos, ultimaLicao, atualizadoEm }
 *   Documento público (para alunos logados) com o total de pontos. Uma única
 *   query ordenada por `pontos` monta a classificação, sem ler o progresso de
 *   ninguém. Não guarda e-mail nem outros dados pessoais.
 * - `usuarios/{uid}/progresso/{licaoId}`: { pontos, estrelas, atualizadoEm }
 *   Melhor resultado de cada lição, visível só para o dono.
 *
 * As Security Rules (firestore.rules) garantem que o total do ranking só muda
 * junto com o progresso de uma lição e nunca passa do máximo dela.
 */
export const COLECAO_RANKING = 'ranking';
export const COLECAO_USUARIOS = 'usuarios';
export const SUBCOLECAO_PROGRESSO = 'progresso';

const timestampSchema = z.custom<Timestamp>((valor) => valor instanceof Timestamp, {
  message: 'Timestamp inválido.',
});

export const registroRankingSchema = z.object({
  nome: z.string().trim().min(1).max(80),
  pontos: z.number().int().min(0),
  ultimaLicao: z.string().min(1).nullable(),
  // Pode faltar por um instante logo após a escrita (serverTimestamp pendente).
  atualizadoEm: timestampSchema.nullable().optional(),
});

export type RegistroRanking = z.infer<typeof registroRankingSchema>;

export const registroProgressoSchema = z.object({
  pontos: z.number().int().min(0),
  estrelas: z.number().int().min(0).max(3),
  atualizadoEm: timestampSchema.nullable().optional(),
});

export type RegistroProgresso = z.infer<typeof registroProgressoSchema>;

/**
 * Converter que valida o documento ao ler. Um documento fora do esquema lança
 * erro em `data()`; quem lê listas usa `lerDocumentos` para descartá-lo.
 */
function criarConverter<T extends DocumentData>(
  schema: z.ZodType<T>,
): FirestoreDataConverter<T, DocumentData> {
  return {
    toFirestore: (modelo) => modelo as DocumentData,
    fromFirestore: (snapshot: QueryDocumentSnapshot, options?: SnapshotOptions) =>
      schema.parse(snapshot.data({ ...options, serverTimestamps: 'estimate' })),
  };
}

export const rankingConverter = criarConverter(registroRankingSchema);
export const progressoConverter = criarConverter(registroProgressoSchema);

/** Lê os documentos de uma consulta, ignorando (com aviso) os inválidos. */
export function lerDocumentos<T>(
  docs: readonly QueryDocumentSnapshot<T>[],
): { id: string; dados: T }[] {
  return docs.flatMap((documento) => {
    try {
      return [{ id: documento.id, dados: documento.data() }];
    } catch (error: unknown) {
      console.warn(`Documento ${documento.ref.path} ignorado por estar fora do esquema:`, error);
      return [];
    }
  });
}
