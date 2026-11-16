import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';

import type { Resposta, ResultadoCorrecao } from '../lib/licoes/correcao';
import { calcularDesempenho, type Desempenho } from '../lib/licoes/desempenho';
import type { Exercicio, Licao } from '../lib/licoes/schemas';
import {
  criarEstadoInicial,
  exercicioAtual,
  reduzirLicao,
  type FaseLicao,
} from '../lib/licoes/sessao-licao';
import { useConcluirAtividade, type ResultadoConclusao } from './use-concluir-atividade';

type UseLicao = {
  fase: FaseLicao;
  exercicio: Exercicio | null;
  /** Muda a cada exercício exibido; use como `key` para zerar o estado do componente. */
  rodada: number;
  resultado: ResultadoCorrecao | null;
  /** Exercícios acertados / total, de 0 a 1. */
  progresso: number;
  desempenho: Desempenho | null;
  /** Retorno do banco depois de salvar a conclusão. */
  conclusao: ResultadoConclusao | null;
  salvando: boolean;
  erroAoSalvar: string | null;
  verificar: (resposta: Resposta) => void;
  continuar: () => void;
  reiniciar: () => void;
  tentarSalvarDeNovo: () => void;
};

/**
 * Controla uma lição: fila de exercícios, correção, feedback e, ao final, o
 * registro de pontos e estrelas no SQLite (uma única vez por conclusão).
 */
export function useLicao(licao: Licao): UseLicao {
  const [estado, despachar] = useReducer(reduzirLicao, licao.exercicios, criarEstadoInicial);
  const { salvando, erro, concluir } = useConcluirAtividade();
  const [conclusao, setConclusao] = useState<ResultadoConclusao | null>(null);
  // Rodada já enviada ao banco: evita salvar duas vezes a mesma conclusão.
  const rodadaSalva = useRef<number | null>(null);

  const desempenho = useMemo(
    () =>
      estado.fase === 'concluida'
        ? calcularDesempenho(
            licao.exercicios.length,
            licao.exercicios.length - estado.errados.length,
            licao.pontos,
          )
        : null,
    [estado.fase, estado.errados.length, licao.exercicios.length, licao.pontos],
  );

  const salvar = useCallback(
    async (resultado: Desempenho) => {
      const retorno = await concluir(licao, resultado.pontos, resultado.estrelas);
      if (retorno) setConclusao(retorno);
    },
    [concluir, licao],
  );

  useEffect(() => {
    if (!desempenho || rodadaSalva.current === estado.rodada) return;
    rodadaSalva.current = estado.rodada;
    void salvar(desempenho);
  }, [desempenho, estado.rodada, salvar]);

  const verificar = useCallback(
    (resposta: Resposta) => despachar({ tipo: 'verificar', resposta }),
    [],
  );
  const continuar = useCallback(() => despachar({ tipo: 'continuar' }), []);
  const reiniciar = useCallback(() => {
    setConclusao(null);
    despachar({ tipo: 'reiniciar' });
  }, []);
  const tentarSalvarDeNovo = useCallback(() => {
    if (desempenho && !salvando) void salvar(desempenho);
  }, [desempenho, salvando, salvar]);

  const total = licao.exercicios.length;

  return {
    fase: estado.fase,
    exercicio: exercicioAtual(estado),
    rodada: estado.rodada,
    resultado: estado.ultimoResultado,
    progresso: total === 0 ? 1 : estado.acertados / total,
    desempenho,
    conclusao,
    salvando,
    erroAoSalvar: erro,
    verificar,
    continuar,
    reiniciar,
    tentarSalvarDeNovo,
  };
}
