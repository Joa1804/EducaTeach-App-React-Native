import type { Resposta, ResultadoCorrecao } from '@/lib/licoes/correcao';

/** Props comuns a todos os componentes de exercício. */
export type PropsExercicio<E> = {
  exercicio: E;
  /** Depois de verificar, a resposta não pode mais ser alterada. */
  travado: boolean;
  resultado: ResultadoCorrecao | null;
  /** Chamado a cada mudança; `null` quando ainda não há resposta. */
  onChange: (resposta: Resposta | null) => void;
};
