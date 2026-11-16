import { useMemo } from 'react';

import { LICOES } from '../data/licoes';
import { montarTrilha, type ResumoTrilha } from '../lib/licoes/trilha';
import { useProgresso } from './use-progresso';

type UseTrilha = ResumoTrilha & {
  carregando: boolean;
  erro: string | null;
  recarregar: () => void;
};

/** Trilha de lições com o status de cada uma para o usuário da sessão. */
export function useTrilha(): UseTrilha {
  const { progresso, carregando, erro, recarregar } = useProgresso();

  const resumo = useMemo(() => montarTrilha(LICOES, progresso), [progresso]);

  return { ...resumo, carregando, erro, recarregar };
}
