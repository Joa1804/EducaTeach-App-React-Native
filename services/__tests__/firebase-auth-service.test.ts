import type * as FirebaseAuth from 'firebase/auth';

import type * as DatabaseModule from '../../db/database';
import type * as ServiceModule from '../firebase-auth-service';
import type * as AuthErrorsModule from '../auth-errors';

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  updateProfile: jest.fn(),
  signOut: jest.fn(),
}));

const mockAuth = {
  currentUser: null as { uid: string; email: string | null; displayName: string | null } | null,
  authStateReady: jest.fn(async () => {}),
};

jest.mock('../../db/firebase', () => ({
  getFirebaseAuth: () => mockAuth,
  getFirestoreDb: () => ({}),
  firebaseHabilitado: () => true,
}));

const mockGarantirPerfil = jest.fn(async () => {});

jest.mock('../firebase/nuvem-firestore', () => ({
  criarNuvemFirestore: () => ({ garantirPerfilRanking: mockGarantirPerfil }),
}));

jest.mock('../sync', () => ({
  sincronizarEmSegundoPlano: jest.fn(),
}));

const SENHA = 'SenhaForte#123';

function erroFirebase(code: string): Error {
  return Object.assign(new Error(code), { code });
}

function credencial(uid: string, displayName: string | null = null) {
  return { user: { uid, email: 'ana@exemplo.com', displayName } } as FirebaseAuth.UserCredential;
}

describe('firebase-auth-service', () => {
  let service: typeof ServiceModule;
  let database: typeof DatabaseModule;
  let erros: typeof AuthErrorsModule;
  let auth: jest.Mocked<typeof FirebaseAuth>;
  let sync: { sincronizarEmSegundoPlano: jest.Mock };

  beforeEach(() => {
    jest.resetModules();
    mockAuth.currentUser = null;
    mockGarantirPerfil.mockReset().mockResolvedValue(undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    database = jest.requireActual('../../db/database');
    service = jest.requireActual('../firebase-auth-service');
    erros = jest.requireActual('../auth-errors');
    auth = jest.requireMock('firebase/auth');
    sync = jest.requireMock('../sync');
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('loginFirebase', () => {
    it('entra, cria o perfil local e dispara a sincronização', async () => {
      auth.signInWithEmailAndPassword.mockResolvedValue(credencial('uid-ana', 'Ana'));

      const usuario = await service.loginFirebase({ email: 'ana@exemplo.com', senha: SENHA });

      expect(usuario).toMatchObject({ nome: 'Ana', firebase_uid: 'uid-ana' });
      expect(sync.sincronizarEmSegundoPlano).toHaveBeenCalledWith(usuario);
      expect(auth.createUserWithEmailAndPassword).not.toHaveBeenCalled();
    });

    it('migra uma conta local antiga para o Firebase e mantém os pontos', async () => {
      const localId = await database.cadastrarUsuario('Ana Antiga', 'ana@exemplo.com', SENHA);
      await database.registrarConclusao(localId, 'variaveis', 50, 1, 3);
      auth.signInWithEmailAndPassword.mockRejectedValue(erroFirebase('auth/invalid-credential'));
      auth.createUserWithEmailAndPassword.mockResolvedValue(credencial('uid-ana'));
      auth.updateProfile.mockResolvedValue(undefined);

      const usuario = await service.loginFirebase({ email: 'ana@exemplo.com', senha: SENHA });

      expect(auth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
        mockAuth,
        'ana@exemplo.com',
        SENHA,
      );
      expect(auth.updateProfile).toHaveBeenCalledWith(expect.anything(), {
        displayName: 'Ana Antiga',
      });
      expect(usuario).toMatchObject({
        id: localId,
        nome: 'Ana Antiga',
        firebase_uid: 'uid-ana',
        pontos: 50,
      });
    });

    it('herda o perfil local quando a conta já existe no Firebase com a mesma senha', async () => {
      const localId = await database.cadastrarUsuario('Ana', 'ana@exemplo.com', SENHA);
      auth.signInWithEmailAndPassword.mockResolvedValue(credencial('uid-ana', 'Ana'));

      const usuario = await service.loginFirebase({ email: 'ana@exemplo.com', senha: SENHA });

      expect(usuario.id).toBe(localId);
    });

    it('recusa credenciais sem conta local equivalente', async () => {
      auth.signInWithEmailAndPassword.mockRejectedValue(erroFirebase('auth/invalid-credential'));

      await expect(
        service.loginFirebase({ email: 'ana@exemplo.com', senha: SENHA }),
      ).rejects.toMatchObject({ code: 'credenciais-invalidas' });
      expect(auth.createUserWithEmailAndPassword).not.toHaveBeenCalled();
    });

    it('não revela que a conta Firebase existe com outra senha', async () => {
      await database.cadastrarUsuario('Ana', 'ana@exemplo.com', SENHA);
      auth.signInWithEmailAndPassword.mockRejectedValue(erroFirebase('auth/invalid-credential'));
      auth.createUserWithEmailAndPassword.mockRejectedValue(
        erroFirebase('auth/email-already-in-use'),
      );

      await expect(
        service.loginFirebase({ email: 'ana@exemplo.com', senha: SENHA }),
      ).rejects.toMatchObject({ code: 'credenciais-invalidas' });
    });

    it('traduz falta de conexão', async () => {
      auth.signInWithEmailAndPassword.mockRejectedValue(
        erroFirebase('auth/network-request-failed'),
      );

      await expect(
        service.loginFirebase({ email: 'ana@exemplo.com', senha: SENHA }),
      ).rejects.toMatchObject({ code: 'sem-conexao' });
    });
  });

  describe('cadastrarFirebase', () => {
    const dados = { nome: 'Ana', email: 'ana@exemplo.com', senha: SENHA, confirmarSenha: SENHA };

    it('cria a conta, salva o nome, registra no ranking e encerra a sessão', async () => {
      auth.createUserWithEmailAndPassword.mockResolvedValue(credencial('uid-ana'));
      auth.updateProfile.mockResolvedValue(undefined);

      await service.cadastrarFirebase(dados);

      expect(auth.updateProfile).toHaveBeenCalledWith(expect.anything(), { displayName: 'Ana' });
      expect(mockGarantirPerfil).toHaveBeenCalledWith('uid-ana', 'Ana');
      expect(auth.signOut).toHaveBeenCalledWith(mockAuth);
    });

    it('e-mail já usado vira EmailJaCadastradoError', async () => {
      auth.createUserWithEmailAndPassword.mockRejectedValue(
        erroFirebase('auth/email-already-in-use'),
      );

      await expect(service.cadastrarFirebase(dados)).rejects.toBeInstanceOf(
        database.EmailJaCadastradoError,
      );
    });

    it('conclui o cadastro mesmo se o ranking não puder ser criado agora', async () => {
      auth.createUserWithEmailAndPassword.mockResolvedValue(credencial('uid-ana'));
      auth.updateProfile.mockResolvedValue(undefined);
      mockGarantirPerfil.mockRejectedValue(new Error('offline'));

      await expect(service.cadastrarFirebase(dados)).resolves.toBeUndefined();
      expect(auth.signOut).toHaveBeenCalled();
    });
  });

  describe('restaurarSessaoFirebase', () => {
    it('sem usuário salvo devolve null', async () => {
      await expect(service.restaurarSessaoFirebase()).resolves.toBeNull();
      expect(mockAuth.authStateReady).toHaveBeenCalled();
    });

    it('com usuário salvo devolve o perfil local vinculado', async () => {
      mockAuth.currentUser = { uid: 'uid-ana', email: 'ana@exemplo.com', displayName: 'Ana' };

      await expect(service.restaurarSessaoFirebase()).resolves.toMatchObject({
        firebase_uid: 'uid-ana',
        nome: 'Ana',
      });
    });
  });

  describe('traduzirErroAuth', () => {
    it.each([
      ['auth/too-many-requests', 'muitas-tentativas'],
      ['auth/weak-password', 'dados-invalidos'],
      ['auth/operation-not-allowed', 'indisponivel'],
      ['auth/wrong-password', 'credenciais-invalidas'],
    ])('%s vira %s', (codigo, esperado) => {
      const erro = service.traduzirErroAuth(erroFirebase(codigo));
      expect(erro).toBeInstanceOf(erros.AuthError);
      expect(erro).toMatchObject({ code: esperado });
    });

    it('mantém erros desconhecidos', () => {
      const original = new Error('outro');
      expect(service.traduzirErroAuth(original)).toBe(original);
    });
  });
});
