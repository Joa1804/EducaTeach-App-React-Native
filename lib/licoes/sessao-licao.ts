import { corrigirExercicio, type Resposta, type ResultadoCorrecao } from './correcao';
import type { Exercicio } from './schemas';

export type FaseLicao = 'respondendo' | 'feedback' | 'concluida';

/**
 * Estado de uma lição em andamento. Como no Duolingo, um exercício errado volta
 * para o fim da fila e a lição só termina quando todos foram acertados.
 */
export type EstadoLicao = {
  exercicios: readonly Exercicio[];
  /** Ids pendentes; o primeiro é o exercício atual. */
  fila: readonly string[];
  fase: FaseLicao;
  ultimoResultado: ResultadoCorrecao | null;
  /** Ids errados pelo menos uma vez. */
  errados: readonly string[];
  /** Exercícios já acertados (cada um conta uma vez). */
  acertados: number;
  /** Total de respostas erradas, contando repetições. */
  totalErros: number;
  /** Incrementa a cada exercício exibido; serve de `key` para zerar o estado da UI. */
  rodada: number;
};

export type AcaoLicao =
  { tipo: 'verificar'; resposta: Resposta } | { tipo: 'continuar' } | { tipo: 'reiniciar' };

export function criarEstadoInicial(exercicios: readonly Exercicio[]): EstadoLicao {
  return {
    exercicios,
    fila: exercicios.map((exercicio) => exercicio.id),
    fase: exercicios.length === 0 ? 'concluida' : 'respondendo',
    ultimoResultado: null,
    errados: [],
    acertados: 0,
    totalErros: 0,
    rodada: 0,
  };
}

export function exercicioAtual(estado: EstadoLicao): Exercicio | null {
  const id = estado.fila[0];
  if (id === undefined) return null;
  return estado.exercicios.find((exercicio) => exercicio.id === id) ?? null;
}

export function reduzirLicao(estado: EstadoLicao, acao: AcaoLicao): EstadoLicao {
  switch (acao.tipo) {
    case 'verificar': {
      // Ignora verificação repetida (duplo toque) ou fora de hora.
      if (estado.fase !== 'respondendo') return estado;
      const atual = exercicioAtual(estado);
      if (!atual) return estado;

      const resultado = corrigirExercicio(atual, acao.resposta);

      return {
        ...estado,
        fase: 'feedback',
        ultimoResultado: resultado,
        acertados: resultado.correta ? estado.acertados + 1 : estado.acertados,
        totalErros: resultado.correta ? estado.totalErros : estado.totalErros + 1,
        errados:
          resultado.correta || estado.errados.includes(atual.id)
            ? estado.errados
            : [...estado.errados, atual.id],
      };
    }

    case 'continuar': {
      if (estado.fase !== 'feedback') return estado;
      const [atual, ...resto] = estado.fila;
      if (atual === undefined) return { ...estado, fase: 'concluida' };

      const fila = estado.ultimoResultado?.correta ? resto : [...resto, atual];

      return {
        ...estado,
        fila,
        fase: fila.length === 0 ? 'concluida' : 'respondendo',
        ultimoResultado: null,
        rodada: estado.rodada + 1,
      };
    }

    case 'reiniciar':
      return { ...criarEstadoInicial(estado.exercicios), rodada: estado.rodada + 1 };
  }
}
