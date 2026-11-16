import { LICOES } from '../../data/licoes';
import {
  buscarProgressoPendente,
  marcarProgressoSincronizado,
  mesclarProgressoRemoto,
  type ProgressoRemoto,
} from '../../db/database';
import type { Licao } from '../../lib/licoes/schemas';
import type { NuvemProgresso } from './tipos';

export type ContaSincronizavel = {
  /** Id do perfil no SQLite. */
  usuarioId: number;
  /** Uid no Firebase Auth. */
  uid: string;
  nome: string;
};

export type ResultadoSincronizacao = {
  recebidas: number;
  enviadas: number;
  /** Lições que falharam ao enviar e continuam pendentes para a próxima vez. */
  falhas: number;
};

type LicaoPontuavel = Pick<Licao, 'id' | 'pontos' | 'moedas'>;

/**
 * Sincronização offline-first: o SQLite é a fonte da verdade no aparelho e a
 * nuvem recebe o que ficou pendente (`sincronizado = 0`).
 *
 * 1. Garante o documento do aluno no ranking.
 * 2. Baixa o progresso da nuvem e mescla (fica o melhor de cada lição), o que
 *    traz o progresso feito em outro aparelho.
 * 3. Envia, uma lição por vez, o que o aparelho tem de melhor que a nuvem.
 *
 * Falhas de envio não interrompem as outras lições; as linhas continuam
 * pendentes e são reenviadas na próxima sincronização.
 */
export async function sincronizarProgresso(
  conta: ContaSincronizavel,
  nuvem: NuvemProgresso,
  licoes: readonly LicaoPontuavel[] = LICOES,
): Promise<ResultadoSincronizacao> {
  const porId = new Map(licoes.map((licao) => [licao.id, licao]));

  await nuvem.garantirPerfilRanking(conta.uid, conta.nome);

  // Só lições conhecidas, com pontos limitados ao máximo atual de cada uma.
  const remotos = (await nuvem.buscarProgresso(conta.uid)).flatMap<ProgressoRemoto>((linha) => {
    const licao = porId.get(linha.atividadeId);
    if (!licao) return [];
    return [
      {
        atividadeId: licao.id,
        pontos: Math.min(licao.pontos, Math.max(0, Math.floor(linha.pontos))),
        estrelas: Math.min(3, Math.max(0, Math.round(linha.estrelas))),
        moedas: licao.moedas,
      },
    ];
  });

  await mesclarProgressoRemoto(conta.usuarioId, remotos);

  const pendentes = (await buscarProgressoPendente(conta.usuarioId)).filter((linha) =>
    porId.has(linha.atividade_id),
  );

  let enviadas = 0;
  let falhas = 0;

  for (const linha of pendentes) {
    const licao = porId.get(linha.atividade_id);
    if (!licao) continue;

    try {
      await nuvem.enviarProgresso(conta.uid, {
        atividadeId: linha.atividade_id,
        pontos: Math.min(licao.pontos, linha.pontos),
        estrelas: linha.estrelas,
      });
      await marcarProgressoSincronizado(
        conta.usuarioId,
        linha.atividade_id,
        linha.pontos,
        linha.estrelas,
      );
      enviadas += 1;
    } catch (error: unknown) {
      falhas += 1;
      console.warn(`Falha ao enviar o progresso de ${linha.atividade_id}:`, error);
    }
  }

  return { recebidas: remotos.length, enviadas, falhas };
}

const emAndamento = new Map<string, Promise<ResultadoSincronizacao>>();

/**
 * Evita duas sincronizações simultâneas da mesma conta (ex.: terminar uma
 * lição e abrir o ranking ao mesmo tempo): a segunda chamada reaproveita a
 * primeira em vez de enviar o mesmo progresso duas vezes.
 */
export function sincronizarProgressoUnico(
  conta: ContaSincronizavel,
  nuvem: NuvemProgresso,
): Promise<ResultadoSincronizacao> {
  const atual = emAndamento.get(conta.uid);
  if (atual) return atual;

  const nova = sincronizarProgresso(conta, nuvem).finally(() => {
    emAndamento.delete(conta.uid);
  });

  emAndamento.set(conta.uid, nova);
  return nova;
}
