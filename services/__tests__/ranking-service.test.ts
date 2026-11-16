import { buscarRanking, type ResumoRanking } from '../../db/database';
import { firebaseHabilitado } from '../../db/firebase';
import { buscarRankingGlobal } from '../firebase/ranking-global';
import { avisoDeFalhaGlobal, carregarRanking } from '../ranking-service';
import { sincronizarUsuario } from '../sync';

jest.mock('../../db/database', () => ({ buscarRanking: jest.fn() }));
jest.mock('../../db/firebase', () => ({
  firebaseHabilitado: jest.fn(),
  getFirestoreDb: () => ({}),
}));
jest.mock('../firebase/ranking-global', () => ({ buscarRankingGlobal: jest.fn() }));
jest.mock('../sync', () => ({ sincronizarUsuario: jest.fn() }));

const buscarRankingMock = jest.mocked(buscarRanking);
const firebaseHabilitadoMock = jest.mocked(firebaseHabilitado);
const buscarRankingGlobalMock = jest.mocked(buscarRankingGlobal);
const sincronizarMock = jest.mocked(sincronizarUsuario);

const RESUMO: ResumoRanking = { lideres: [], total: 0, usuario: null };
const CONTA = { id: 7, nome: 'Ana', firebase_uid: 'uid-ana' };

describe('carregarRanking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    buscarRankingMock.mockResolvedValue(RESUMO);
    buscarRankingGlobalMock.mockResolvedValue(RESUMO);
    sincronizarMock.mockResolvedValue(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('com Firebase sincroniza e lê o ranking global pelo uid', async () => {
    firebaseHabilitadoMock.mockReturnValue(true);

    const carregado = await carregarRanking(CONTA, 50);

    expect(sincronizarMock).toHaveBeenCalledWith(CONTA);
    expect(buscarRankingGlobalMock).toHaveBeenCalledWith({}, 'uid-ana', 50);
    expect(carregado).toMatchObject({ fonte: 'global', chaveUsuario: 'uid-ana', aviso: null });
    expect(buscarRankingMock).not.toHaveBeenCalled();
  });

  it('falha na sincronização não impede ler o ranking global', async () => {
    firebaseHabilitadoMock.mockReturnValue(true);
    sincronizarMock.mockRejectedValue(new Error('offline'));

    await expect(carregarRanking(CONTA, 50)).resolves.toMatchObject({ fonte: 'global' });
  });

  it('sem internet cai para o ranking do aparelho com aviso', async () => {
    firebaseHabilitadoMock.mockReturnValue(true);
    buscarRankingGlobalMock.mockRejectedValue(
      Object.assign(new Error('x'), { code: 'unavailable' }),
    );

    const carregado = await carregarRanking(CONTA, 50);

    expect(buscarRankingMock).toHaveBeenCalledWith(7, 50);
    expect(carregado).toMatchObject({ fonte: 'local', chaveUsuario: '7' });
    expect(carregado.aviso).toMatch(/Sem conexão/);
  });

  it('sem Firebase configurado usa o ranking local sem aviso', async () => {
    firebaseHabilitadoMock.mockReturnValue(false);

    const carregado = await carregarRanking(CONTA, 50);

    expect(sincronizarMock).not.toHaveBeenCalled();
    expect(carregado).toMatchObject({ fonte: 'local', chaveUsuario: '7', aviso: null });
  });

  it('conta local (sem uid) usa o ranking do aparelho', async () => {
    firebaseHabilitadoMock.mockReturnValue(true);

    await carregarRanking({ ...CONTA, firebase_uid: null }, 50);

    expect(buscarRankingGlobalMock).not.toHaveBeenCalled();
    expect(buscarRankingMock).toHaveBeenCalledWith(7, 50);
  });

  it('sem usuário lista só os líderes locais', async () => {
    firebaseHabilitadoMock.mockReturnValue(false);

    await expect(carregarRanking(null, 50)).resolves.toMatchObject({ chaveUsuario: null });
    expect(buscarRankingMock).toHaveBeenCalledWith(null, 50);
  });
});

describe('avisoDeFalhaGlobal', () => {
  const erro = (code: string) => Object.assign(new Error(code), { code });

  it.each([
    ['permission-denied', /regras do Firestore/],
    ['failed-precondition', /índices/],
    ['unavailable', /Sem conexão/],
    ['deadline-exceeded', /Sem conexão/],
    ['internal', /indisponível agora/],
  ])('%s', (codigo, esperado) => {
    expect(avisoDeFalhaGlobal(erro(codigo))).toMatch(esperado);
  });

  it('erro sem código', () => {
    expect(avisoDeFalhaGlobal(new Error('?'))).toMatch(/indisponível agora/);
  });
});
