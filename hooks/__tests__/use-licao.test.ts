import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useUsuario } from '../../context/UsuarioContext';
import { registrarConclusao, type Usuario } from '../../db/database';
import { licaoSchema, type Licao } from '../../lib/licoes/schemas';
import { useLicao } from '../use-licao';

jest.mock('../../db/database', () => ({
  registrarConclusao: jest.fn(),
}));

jest.mock('../../context/UsuarioContext', () => ({
  useUsuario: jest.fn(),
}));

const registrarConclusaoMock = jest.mocked(registrarConclusao);
const useUsuarioMock = jest.mocked(useUsuario);

const USUARIO: Usuario = {
  id: 3,
  nome: 'Caio',
  email: 'caio@exemplo.com',
  tipo: 'aluno',
  avatar: 'padrao',
  pontos: 0,
  moedas: 0,
  firebase_uid: null,
};

const opcoes = [
  { id: 'certa', texto: 'Certa' },
  { id: 'errada', texto: 'Errada' },
];

const LICAO: Licao = licaoSchema.parse({
  id: 'teste',
  titulo: 'Teste',
  descricao: 'Lição de teste',
  icone: 'cube',
  dificuldade: 'facil',
  moedas: 1,
  exercicios: ['e1', 'e2'].map((id) => ({
    id,
    tipo: 'multipla-escolha',
    enunciado: id,
    opcoes,
    respostaCorretaId: 'certa',
    explicacao: '...',
  })),
});

const CERTA = { tipo: 'multipla-escolha', opcaoId: 'certa' } as const;
const ERRADA = { tipo: 'multipla-escolha', opcaoId: 'errada' } as const;

describe('useLicao', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    useUsuarioMock.mockReturnValue({
      usuario: USUARIO,
      status: 'autenticado',
      entrar: jest.fn(),
      sair: jest.fn(),
      recarregarUsuario: jest.fn(async () => {}),
    });
    registrarConclusaoMock.mockResolvedValue({ primeiraVez: true, pontosGanhos: 25 });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  async function responder(
    result: { current: ReturnType<typeof useLicao> },
    resposta: typeof CERTA | typeof ERRADA,
  ) {
    await act(async () => {
      result.current.verificar(resposta);
    });
    await act(async () => {
      result.current.continuar();
    });
  }

  it('salva uma única vez com pontos e estrelas proporcionais aos erros', async () => {
    const { result, rerender } = await renderHook(() => useLicao(LICAO));

    await responder(result, ERRADA);
    expect(result.current.progresso).toBe(0);
    await responder(result, CERTA);
    expect(result.current.progresso).toBe(0.5);
    await responder(result, CERTA);

    expect(result.current.fase).toBe('concluida');
    expect(result.current.desempenho).toMatchObject({ estrelas: 1, pontos: 25, precisao: 50 });
    await waitFor(() =>
      expect(result.current.conclusao).toEqual({ primeiraVez: true, pontosGanhos: 25 }),
    );

    await rerender({});
    expect(registrarConclusaoMock).toHaveBeenCalledTimes(1);
    expect(registrarConclusaoMock).toHaveBeenCalledWith(3, 'teste', 25, 1, 1);
  });

  it('ao refazer a lição salva de novo a nova tentativa', async () => {
    const { result } = await renderHook(() => useLicao(LICAO));
    await responder(result, CERTA);
    await responder(result, CERTA);
    await waitFor(() => expect(registrarConclusaoMock).toHaveBeenCalledTimes(1));
    expect(registrarConclusaoMock).toHaveBeenLastCalledWith(3, 'teste', 50, 1, 3);

    await act(async () => {
      result.current.reiniciar();
    });
    expect(result.current.fase).toBe('respondendo');
    expect(result.current.conclusao).toBeNull();

    await responder(result, CERTA);
    await responder(result, CERTA);
    await waitFor(() => expect(registrarConclusaoMock).toHaveBeenCalledTimes(2));
  });

  it('expõe o erro e permite tentar salvar de novo', async () => {
    registrarConclusaoMock.mockRejectedValueOnce(new Error('SQLITE_BUSY'));
    const { result } = await renderHook(() => useLicao(LICAO));
    await responder(result, CERTA);
    await responder(result, CERTA);

    await waitFor(() => expect(result.current.erroAoSalvar).not.toBeNull());
    expect(result.current.conclusao).toBeNull();

    await act(async () => {
      result.current.tentarSalvarDeNovo();
    });

    await waitFor(() => expect(result.current.conclusao).not.toBeNull());
    expect(result.current.erroAoSalvar).toBeNull();
    expect(registrarConclusaoMock).toHaveBeenCalledTimes(2);
  });
});
