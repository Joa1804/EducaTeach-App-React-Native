import { act, renderHook, waitFor } from '@testing-library/react-native';

import type { Atividade } from '../../data/atividade';
import { registrarConclusao, type Usuario } from '../../db/database';
import { useUsuario } from '../../context/UsuarioContext';
import { useConcluirAtividade } from '../use-concluir-atividade';

jest.mock('../../db/database', () => ({
  registrarConclusao: jest.fn(),
}));

jest.mock('../../context/UsuarioContext', () => ({
  useUsuario: jest.fn(),
}));

const registrarConclusaoMock = jest.mocked(registrarConclusao);
const useUsuarioMock = jest.mocked(useUsuario);

const USUARIO: Usuario = {
  id: 7,
  nome: 'Ana',
  email: 'ana@exemplo.com',
  tipo: 'aluno',
  avatar: 'padrao',
  pontos: 0,
  moedas: 0,
};

const ATIVIDADE: Atividade = {
  id: 'condicionais',
  titulo: 'Condicionais',
  icone: 'help',
  dificuldade: 'medio',
  pontos: 20,
  moedas: 2,
};

function mockarSessao(usuario: Usuario | null, recarregarUsuario = jest.fn(async () => {})) {
  useUsuarioMock.mockReturnValue({
    usuario,
    status: usuario ? 'autenticado' : 'anonimo',
    entrar: jest.fn(),
    sair: jest.fn(),
    recarregarUsuario,
  });

  return recarregarUsuario;
}

describe('useConcluirAtividade', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('registra a conclusão e recarrega o usuário', async () => {
    const recarregarUsuario = mockarSessao(USUARIO);
    registrarConclusaoMock.mockResolvedValue({
      primeiraVez: true,
      pontosGanhos: 20,
    });
    const { result } = await renderHook(() => useConcluirAtividade());

    let resultado: Awaited<ReturnType<typeof result.current.concluir>> = null;
    await act(async () => {
      resultado = await result.current.concluir(ATIVIDADE);
    });

    expect(resultado).toEqual({ primeiraVez: true, pontosGanhos: 20 });
    expect(registrarConclusaoMock).toHaveBeenCalledWith(7, 'condicionais', 20, 2, 0);
    expect(recarregarUsuario).toHaveBeenCalledTimes(1);
    expect(result.current.salvando).toBe(false);
    expect(result.current.erro).toBeNull();
  });

  it.each([
    { obtidos: 999, esperado: 20 },
    { obtidos: -5, esperado: 0 },
    { obtidos: 12.6, esperado: 13 },
  ])(
    'limita a pontuação $obtidos ao intervalo da atividade ($esperado)',
    async ({ obtidos, esperado }: { obtidos: number; esperado: number }) => {
      mockarSessao(USUARIO);
      registrarConclusaoMock.mockResolvedValue({
        primeiraVez: true,
        pontosGanhos: esperado,
      });
      const { result } = await renderHook(() => useConcluirAtividade());

      await act(async () => {
        await result.current.concluir(ATIVIDADE, obtidos);
      });

      expect(registrarConclusaoMock).toHaveBeenCalledWith(7, 'condicionais', esperado, 2, 0);
    },
  );

  it('repassa as estrelas da lição para o banco', async () => {
    mockarSessao(USUARIO);
    registrarConclusaoMock.mockResolvedValue({ primeiraVez: true, pontosGanhos: 12 });
    const { result } = await renderHook(() => useConcluirAtividade());

    await act(async () => {
      await result.current.concluir(ATIVIDADE, 12, 2);
    });

    expect(registrarConclusaoMock).toHaveBeenCalledWith(7, 'condicionais', 12, 2, 2);
  });

  it('não faz nada sem usuário na sessão', async () => {
    mockarSessao(null);
    const { result } = await renderHook(() => useConcluirAtividade());

    let resultado: Awaited<ReturnType<typeof result.current.concluir>> = null;
    await act(async () => {
      resultado = await result.current.concluir(ATIVIDADE);
    });

    expect(resultado).toBeNull();
    expect(registrarConclusaoMock).not.toHaveBeenCalled();
  });

  it('ignora um segundo envio enquanto o primeiro está em andamento (duplo toque)', async () => {
    mockarSessao(USUARIO);
    let concluirEnvio: (valor: { primeiraVez: boolean; pontosGanhos: number }) => void = () => {};
    registrarConclusaoMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          concluirEnvio = resolve;
        }),
    );
    const { result } = await renderHook(() => useConcluirAtividade());

    let primeiro: Promise<unknown> = Promise.resolve();
    let segundo: unknown;
    await act(async () => {
      primeiro = result.current.concluir(ATIVIDADE);
      segundo = await result.current.concluir(ATIVIDADE);
    });

    expect(segundo).toBeNull();
    expect(result.current.salvando).toBe(true);

    await act(async () => {
      concluirEnvio({ primeiraVez: true, pontosGanhos: 20 });
      await primeiro;
    });

    expect(registrarConclusaoMock).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(result.current.salvando).toBe(false));
  });

  it('expõe mensagem de erro amigável quando o banco falha', async () => {
    mockarSessao(USUARIO);
    registrarConclusaoMock.mockRejectedValue(new Error('SQLITE_BUSY'));
    const { result } = await renderHook(() => useConcluirAtividade());

    let resultado: Awaited<ReturnType<typeof result.current.concluir>> = null;
    await act(async () => {
      resultado = await result.current.concluir(ATIVIDADE);
    });

    expect(resultado).toBeNull();
    expect(result.current.erro).toBe('Não foi possível salvar seu progresso. Tente novamente.');
    expect(result.current.salvando).toBe(false);
  });
});
