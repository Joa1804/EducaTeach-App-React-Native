import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useUsuario } from '../../context/UsuarioContext';
import { buscarRanking, type ResumoRanking, type Usuario } from '../../db/database';
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

jest.mock('../../db/database', () => ({
  buscarRanking: jest.fn(),
}));

jest.mock('../../context/UsuarioContext', () => ({
  useUsuario: jest.fn(),
}));

const buscarRankingMock = jest.mocked(buscarRanking);
const useUsuarioMock = jest.mocked(useUsuario);

const USUARIO: Usuario = {
  id: 2,
  nome: 'Bia',
  email: 'bia@exemplo.com',
  tipo: 'aluno',
  avatar: 'padrao',
  pontos: 100,
  moedas: 0,
};

const RESUMO: ResumoRanking = {
  lideres: [
    { id: 1, nome: 'Ana', avatar: 'padrao', pontos: 150 },
    { id: 2, nome: 'Bia', avatar: 'padrao', pontos: 100 },
  ],
  total: 2,
  usuario: {
    linha: { id: 2, nome: 'Bia', avatar: 'padrao', pontos: 100 },
    posicao: 2,
    acima: { id: 1, nome: 'Ana', avatar: 'padrao', pontos: 150 },
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
    buscarRankingMock.mockResolvedValue(RESUMO);

    const { result } = await renderHook(() => useRanking());

    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(buscarRankingMock).toHaveBeenCalledWith(2, LIMITE_RANKING);
    expect(result.current.itens.map((item) => [item.nome, item.posicao, item.voce])).toEqual([
      ['Ana', 1, false],
      ['Bia', 2, true],
    ]);
    expect(result.current.usuario).toMatchObject({ posicao: 2, pontosParaSubir: 51 });
    expect(result.current.erro).toBeNull();
  });

  it('mostra erro e permite tentar de novo', async () => {
    mockarSessao(USUARIO);
    buscarRankingMock.mockRejectedValueOnce(new Error('falhou')).mockResolvedValueOnce(RESUMO);

    const { result } = await renderHook(() => useRanking());

    await waitFor(() => expect(result.current.erro).toBe('Não foi possível carregar o ranking.'));
    expect(result.current.itens).toEqual([]);

    await act(async () => {
      result.current.recarregar();
    });

    await waitFor(() => expect(result.current.erro).toBeNull());
    expect(result.current.itens).toHaveLength(2);
    expect(buscarRankingMock).toHaveBeenCalledTimes(2);
  });

  it('sem sessão busca só os líderes', async () => {
    mockarSessao(null);
    buscarRankingMock.mockResolvedValue({ ...RESUMO, usuario: null });

    const { result } = await renderHook(() => useRanking());

    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(buscarRankingMock).toHaveBeenCalledWith(null, LIMITE_RANKING);
    expect(result.current.usuario).toBeNull();
  });

  it('busca de novo quando os pontos do usuário mudam', async () => {
    mockarSessao(USUARIO);
    buscarRankingMock.mockResolvedValue(RESUMO);

    const { result, rerender } = await renderHook(() => useRanking());
    await waitFor(() => expect(result.current.carregando).toBe(false));

    mockarSessao({ ...USUARIO, pontos: 250 });
    await rerender({});

    await waitFor(() => expect(buscarRankingMock).toHaveBeenCalledTimes(2));
  });
});
