import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { useUsuario } from '../context/UsuarioContext';
import { buscarRanking, type ResumoRanking } from '../db/database';
import { montarRanking, type Ranking } from '../lib/ranking/ranking';

/** Quantos líderes a tela mostra; o usuário atual entra no fim se ficar de fora. */
export const LIMITE_RANKING = 50;

type UseRanking = Ranking & {
  carregando: boolean;
  erro: string | null;
  recarregar: () => void;
};

const VAZIO: ResumoRanking = { lideres: [], total: 0, usuario: null };

/**
 * Ranking dos usuários cadastrados neste aparelho, relido sempre que a tela
 * ganha foco (ex.: ao voltar de uma lição com pontos novos).
 */
export function useRanking(): UseRanking {
  const { usuario } = useUsuario();
  const usuarioId = usuario?.id ?? null;
  // Os pontos entram nas dependências para atualizar quando o contexto muda.
  const pontosDoUsuario = usuario?.pontos ?? null;

  const [resumo, setResumo] = useState<ResumoRanking>(VAZIO);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);

  const recarregar = useCallback(() => setVersao((atual) => atual + 1), []);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      setCarregando(true);

      buscarRanking(usuarioId, LIMITE_RANKING)
        .then((dados) => {
          if (!ativo) return;
          setResumo(dados);
          setErro(null);
        })
        .catch((error: unknown) => {
          console.error('Erro ao carregar o ranking:', error);
          if (ativo) setErro('Não foi possível carregar o ranking.');
        })
        .finally(() => {
          if (ativo) setCarregando(false);
        });

      return () => {
        ativo = false;
      };
      // `versao` e `pontosDoUsuario` só servem para disparar uma nova busca.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usuarioId, pontosDoUsuario, versao]),
  );

  const ranking = useMemo(() => montarRanking(resumo, usuarioId), [resumo, usuarioId]);

  return { ...ranking, carregando, erro, recarregar };
}
