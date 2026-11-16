import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { useUsuario } from '../context/UsuarioContext';
import { montarRanking, type Ranking } from '../lib/ranking/ranking';
import {
  carregarRanking,
  type RankingCarregado,
  type FonteRanking,
} from '../services/ranking-service';

/** Quantos líderes a tela mostra; o usuário atual entra no fim se ficar de fora. */
export const LIMITE_RANKING = 50;

type UseRanking = Ranking & {
  fonte: FonteRanking;
  aviso: string | null;
  carregando: boolean;
  erro: string | null;
  recarregar: () => void;
};

const VAZIO: RankingCarregado = {
  resumo: { lideres: [], total: 0, usuario: null },
  fonte: 'local',
  chaveUsuario: null,
  aviso: null,
};

/**
 * Ranking global (Firebase) ou do aparelho (SQLite), relido sempre que a tela
 * ganha foco (ex.: ao voltar de uma lição com pontos novos).
 */
export function useRanking(): UseRanking {
  const { usuario } = useUsuario();
  const usuarioId = usuario?.id ?? null;
  const nome = usuario?.nome ?? '';
  const firebaseUid = usuario?.firebase_uid ?? null;
  // Os pontos entram nas dependências para atualizar quando o contexto muda.
  const pontosDoUsuario = usuario?.pontos ?? null;

  const [dados, setDados] = useState<RankingCarregado>(VAZIO);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);

  const recarregar = useCallback(() => setVersao((atual) => atual + 1), []);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      setCarregando(true);

      const alvo = usuarioId === null ? null : { id: usuarioId, nome, firebase_uid: firebaseUid };

      carregarRanking(alvo, LIMITE_RANKING)
        .then((carregado) => {
          if (!ativo) return;
          setDados(carregado);
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
    }, [usuarioId, nome, firebaseUid, pontosDoUsuario, versao]),
  );

  const ranking = useMemo(
    () => montarRanking(dados.resumo, dados.chaveUsuario),
    [dados.resumo, dados.chaveUsuario],
  );

  return { ...ranking, fonte: dados.fonte, aviso: dados.aviso, carregando, erro, recarregar };
}
