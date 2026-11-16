import type { Licao } from './schemas';

export type StatusEtapa = 'concluida' | 'disponivel' | 'bloqueada';

/** Dados mínimos de progresso que a trilha precisa (vêm do SQLite). */
export type ProgressoLicao = {
  atividade_id: string;
  pontos: number;
  estrelas: number;
};

export type EtapaTrilha = {
  licao: Licao;
  /** Posição na trilha, começando em 0. */
  indice: number;
  status: StatusEtapa;
  /** 0 a 3. */
  estrelas: number;
  /** Melhor pontuação já obtida. */
  pontos: number;
};

export type ResumoTrilha = {
  etapas: EtapaTrilha[];
  concluidas: number;
  total: number;
  /** Primeira etapa disponível ainda não concluída, se houver. */
  proxima: EtapaTrilha | null;
};

function limitarEstrelas(valor: number): number {
  return Number.isFinite(valor) ? Math.min(3, Math.max(0, Math.round(valor))) : 0;
}

/**
 * Cruza as lições com o progresso salvo. Cada lição só é liberada depois que a
 * anterior foi concluída; a primeira está sempre disponível. Registros de
 * atividades que não existem mais na trilha são ignorados.
 */
export function montarTrilha(
  licoes: readonly Licao[],
  progresso: readonly ProgressoLicao[],
): ResumoTrilha {
  const porAtividade = new Map(progresso.map((linha) => [linha.atividade_id, linha]));

  let anteriorConcluida = true;
  const etapas = licoes.map<EtapaTrilha>((licao, indice) => {
    const registro = porAtividade.get(licao.id);
    const status: StatusEtapa = registro
      ? 'concluida'
      : anteriorConcluida
        ? 'disponivel'
        : 'bloqueada';

    anteriorConcluida = status === 'concluida';

    return {
      licao,
      indice,
      status,
      estrelas: registro ? limitarEstrelas(registro.estrelas) : 0,
      pontos: registro?.pontos ?? 0,
    };
  });

  return {
    etapas,
    concluidas: etapas.filter((etapa) => etapa.status === 'concluida').length,
    total: etapas.length,
    proxima: etapas.find((etapa) => etapa.status === 'disponivel') ?? null,
  };
}
