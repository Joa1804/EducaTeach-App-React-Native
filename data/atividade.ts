import type { Ionicons } from '@expo/vector-icons';

import type { Dificuldade } from '../lib/licoes/dificuldade';
import { LICOES } from './licoes';

export type { Dificuldade };

/** Dados de pontuação de uma atividade (subconjunto de uma lição). */
export type Atividade = {
  id: string;
  titulo: string;
  icone: keyof typeof Ionicons.glyphMap;
  dificuldade: Dificuldade;
  pontos: number;
  moedas: number;
};

/** Atividades da trilha, derivadas das lições para existir uma única fonte de dados. */
export const ATIVIDADE: readonly Atividade[] = LICOES;
