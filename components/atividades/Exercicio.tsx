import React from 'react';

import type { Resposta, ResultadoCorrecao } from '@/lib/licoes/correcao';
import type { Exercicio as ExercicioModelo } from '@/lib/licoes/schemas';

import { ExercicioCompletarCodigo } from './ExercicioCompletarCodigo';
import { ExercicioMultiplaEscolha } from './ExercicioMultiplaEscolha';
import { ExercicioOrdenarLinhas } from './ExercicioOrdenarLinhas';
import { ExercicioPseudocodigo } from './ExercicioPseudocodigo';

type Props = {
  exercicio: ExercicioModelo;
  travado: boolean;
  resultado: ResultadoCorrecao | null;
  onChange: (resposta: Resposta | null) => void;
};

/** Escolhe o componente de acordo com o tipo do exercício. */
export function Exercicio({ exercicio, ...props }: Props) {
  switch (exercicio.tipo) {
    case 'multipla-escolha':
      return <ExercicioMultiplaEscolha exercicio={exercicio} {...props} />;
    case 'completar-codigo':
      return <ExercicioCompletarCodigo exercicio={exercicio} {...props} />;
    case 'ordenar-linhas':
      return <ExercicioOrdenarLinhas exercicio={exercicio} {...props} />;
    case 'escrever-pseudocodigo':
      return <ExercicioPseudocodigo exercicio={exercicio} {...props} />;
  }
}

export const ROTULO_TIPO: Readonly<Record<ExercicioModelo['tipo'], string>> = {
  'multipla-escolha': 'Escolha a resposta',
  'completar-codigo': 'Complete o código',
  'ordenar-linhas': 'Ordene as linhas',
  'escrever-pseudocodigo': 'Escreva o pseudocódigo',
};
