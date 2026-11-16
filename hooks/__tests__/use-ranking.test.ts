import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useUsuario } from '../../context/UsuarioContext';
import type { Usuario } from '../../db/database';
import { carregarRanking, type RankingCarregado } from '../../services/ranking-service';
import { LIMITE_RANKING, useRanking } from '../use-ranking';

// Sem navegação nos testes: o "foco" acontece na montagem.
jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual<typeof import('react')>('react');
  return {
    useFocusEffect: (efeito: () => void | (() => void)) => {
      useEffect(efeito, [efeito]);
    },
  };
});

jest.mock('../../services/ranking-service', () => ({
  carregarRanking: jest.fn(),
}));

jest.mock('../../context/UsuarioContext', () => ({
  useUsuario: jest.fn(),
}));

const carregarRankingMock = jest.mocked(carregarRanking);
const useUsuarioMock = jest.mocked(useUsuario);

const USUARIO: Usuario = {
  id: 2,
  nome: 'Bia',
  email: 'bia@exemplo.com',
  tipo: 'aluno',
  avatar: 'padrao',
  pontos: 100,
  moedas: 0,
  firebase_uid: 'uid-bia',
};

const GLOBAL: RankingCarregado = {
  fonte: 'global',
  chaveUsuario: 'uid-bia',
  aviso: null,
  resumo: {
    lideres: [
      { id: 'uid-ana', nome: 'Ana', avatar: 'padrao', pontos: 150 },
      { id: 'uid-bia', nome: 'Bia', avatar: 'padrao', pontos: 100 },
    ],
    total: 2,
    usuario: {
      linha: { id: 'uid-bia', nome: 'Bia', avatar: 'padrao', pontos: 100 },
      posicao: 2,
      acima: { id: 'uid-ana', nome: 'Ana', avatar: 'padrao', pontos: 150 },
    },
  },
};

function mockarSessao(usuario: Usuario | null) {
  useUsuarioMock.mockReturnValue({
    usuario,
    status: usuario ? 'autenticado' : 'anonimo',
    entrar: jest.fn(),
    sair: jest.fn(),
    recarregarUsuario: jest.fn(async () => {}),
  });
}

describe('useRanking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('carrega o ranking do usuário da sessão e destaca a linha dele', async () => {
    mockarSessao(USUARIO);
    carregarRankingMock.mockResolvedValue(GLOBAL);

    const { result } = await renderHook(() => useRanking());

    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(carregarRankingMock).toHaveBeenCalledWith(
      { id: 2, nome: 'Bia', firebase_uid: 'uid-bia' },
      LIMITE_RANKING,
    );
    expect(result.current.fonte).toBe('global');
    expect(result.current.itens.map((item) => [item.nome, item.posicao, item.voce])).toEqual([
      ['Ana', 1, false],
      ['Bia', 2, true],
    ]);
    expect(result.current.usuario).toMatchObject({ posicao: 2, pontosParaSubir: 51 });
    expect(result.current.erro).toBeNull();
  });

  it('repassa o aviso quando caiu para o ranking do aparelho', async () => {
    mockarSessao(USUARIO);
    carregarRankingMock.mockResolvedValue({
      ...GLOBAL,
      fonte: 'local',
      chaveUsuario: '2',
      aviso: 'Sem conexão: mostrando o ranking deste aparelho.',
      resumo: { ...GLOBAL.resumo, usuario: null, lideres: [] },
    });

    const { result } = await renderHook(() => useRanking());

    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.fonte).toBe('local');
    expect(result.current.aviso).toMatch(/Sem conexão/);
  });

  it('mostra erro e permite tentar de novo', async () => {
    mockarSessao(USUARIO);
    carregarRankingMock.mockRejectedValueOnce(new Error('falhou')).mockResolvedValueOnce(GLOBAL);

    const { result } = await renderHook(() => useRanking());

    await waitFor(() => expect(result.current.erro).toBe('Não foi possível carregar o ranking.'));
    expect(result.current.itens).toEqual([]);

    await act(async () => {
      result.current.recarregar();
    });

    await waitFor(() => expect(result.current.erro).toBeNull());
    expect(result.current.itens).toHaveLength(2);
    expect(carregarRankingMock).toHaveBeenCalledTimes(2);
  });

  it('sem sessão busca só os líderes', async () => {
    mockarSessao(null);
    carregarRankingMock.mockResolvedValue({
      ...GLOBAL,
      chaveUsuario: null,
      resumo: { ...GLOBAL.resumo, usuario: null },
    });

    const { result } = await renderHook(() => useRanking());

    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(carregarRankingMock).toHaveBeenCalledWith(null, LIMITE_RANKING);
    expect(result.current.usuario).toBeNull();
  });

  it('busca de novo quando os pontos do usuário mudam', async () => {
    mockarSessao(USUARIO);
    carregarRankingMock.mockResolvedValue(GLOBAL);

    const { result, rerender } = await renderHook(() => useRanking());
    await waitFor(() => expect(result.current.carregando).toBe(false));

    mockarSessao({ ...USUARIO, pontos: 250 });
    await rerender({});

    await waitFor(() => expect(carregarRankingMock).toHaveBeenCalledTimes(2));
  });
});
