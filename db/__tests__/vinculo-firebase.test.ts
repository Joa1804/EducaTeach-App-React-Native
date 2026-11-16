import type * as DatabaseModule from '../database';

/** Recarrega o módulo a cada teste para ter um banco em memória novo. */
function carregarDatabase(): typeof DatabaseModule {
  jest.resetModules();
  return jest.requireActual<typeof DatabaseModule>('../database');
}

const SENHA = 'SenhaForte#123';

describe('db/database: contas Firebase e sincronização', () => {
  let database: typeof DatabaseModule;

  beforeEach(() => {
    database = carregarDatabase();
  });

  describe('vincularContaFirebase', () => {
    it('cria um perfil local novo para uma conta desconhecida', async () => {
      const usuario = await database.vincularContaFirebase({
        uid: 'uid-ana',
        nome: '  Ana  ',
        email: 'ANA@exemplo.com',
      });

      expect(usuario).toMatchObject({
        nome: 'Ana',
        email: 'ana@exemplo.com',
        firebase_uid: 'uid-ana',
        pontos: 0,
      });
      await expect(database.buscarUsuarioPorFirebaseUid('uid-ana')).resolves.toEqual(usuario);
    });

    it('é idempotente e atualiza o nome nas entradas seguintes', async () => {
      const primeiro = await database.vincularContaFirebase({
        uid: 'uid-ana',
        nome: 'Ana',
        email: 'ana@exemplo.com',
      });
      const segundo = await database.vincularContaFirebase({
        uid: 'uid-ana',
        nome: 'Ana Souza',
        email: 'ana@exemplo.com',
      });

      expect(segundo.id).toBe(primeiro.id);
      expect(segundo.nome).toBe('Ana Souza');
    });

    it('liga um perfil local verificado e mantém o progresso dele', async () => {
      const localId = await database.cadastrarUsuario('Ana', 'ana@exemplo.com', SENHA);
      await database.registrarConclusao(localId, 'variaveis', 50, 1, 3);

      const usuario = await database.vincularContaFirebase(
        { uid: 'uid-ana', nome: 'Ana', email: 'ana@exemplo.com' },
        { perfilLocalVerificadoId: localId },
      );

      expect(usuario).toMatchObject({ id: localId, firebase_uid: 'uid-ana', pontos: 50 });
      // O perfil passa a entrar só pelo Firebase: a senha local deixa de valer.
      await expect(database.autenticar('ana@exemplo.com', SENHA)).resolves.toBeNull();
    });

    it('não herda o perfil local de mesmo e-mail sem verificação de senha', async () => {
      const localId = await database.cadastrarUsuario('Ana', 'ana@exemplo.com', SENHA);
      await database.registrarConclusao(localId, 'variaveis', 50, 1, 3);

      const usuario = await database.vincularContaFirebase({
        uid: 'uid-intruso',
        nome: 'Outra pessoa',
        email: 'ana@exemplo.com',
      });

      expect(usuario.id).not.toBe(localId);
      expect(usuario).toMatchObject({ pontos: 0, email: 'uid-intruso@firebase.local' });
      await expect(database.buscarUsuario(localId)).resolves.toMatchObject({
        firebase_uid: null,
        pontos: 50,
      });
    });

    it('não religa um perfil que já pertence a outra conta', async () => {
      const ana = await database.vincularContaFirebase({
        uid: 'uid-ana',
        nome: 'Ana',
        email: 'ana@exemplo.com',
      });

      const outro = await database.vincularContaFirebase(
        { uid: 'uid-bia', nome: 'Bia', email: 'bia@exemplo.com' },
        { perfilLocalVerificadoId: ana.id },
      );

      expect(outro.id).not.toBe(ana.id);
      await expect(database.buscarUsuarioPorFirebaseUid('uid-ana')).resolves.toMatchObject({
        id: ana.id,
      });
    });

    it('rejeita uid vazio', async () => {
      await expect(
        database.vincularContaFirebase({ uid: '  ', nome: 'Ana', email: 'ana@exemplo.com' }),
      ).rejects.toThrow('Uid do Firebase vazio.');
    });
  });

  describe('progresso pendente', () => {
    let usuarioId: number;

    beforeEach(async () => {
      ({ id: usuarioId } = await database.vincularContaFirebase({
        uid: 'uid-ana',
        nome: 'Ana',
        email: 'ana@exemplo.com',
      }));
    });

    it('lista só o que ainda não foi enviado', async () => {
      await database.registrarConclusao(usuarioId, 'comandos-basicos', 50, 1, 3);
      await database.registrarConclusao(usuarioId, 'variaveis', 40, 1, 2);
      await database.marcarProgressoSincronizado(usuarioId, 'comandos-basicos', 50, 3);

      const pendentes = await database.buscarProgressoPendente(usuarioId);
      expect(pendentes.map((linha) => linha.atividade_id)).toEqual(['variaveis']);
    });

    it('não marca como sincronizada uma linha que mudou durante o envio', async () => {
      await database.registrarConclusao(usuarioId, 'variaveis', 40, 1, 2);
      // O aluno refez a lição enquanto o envio de 40 pontos estava em andamento.
      await database.registrarConclusao(usuarioId, 'variaveis', 50, 1, 3);

      await expect(
        database.marcarProgressoSincronizado(usuarioId, 'variaveis', 40, 2),
      ).resolves.toBe(false);
      await expect(database.buscarProgressoPendente(usuarioId)).resolves.toHaveLength(1);
    });

    it('uma nova conclusão volta a deixar a linha pendente', async () => {
      await database.registrarConclusao(usuarioId, 'variaveis', 40, 1, 2);
      await database.marcarProgressoSincronizado(usuarioId, 'variaveis', 40, 2);
      await database.registrarConclusao(usuarioId, 'variaveis', 50, 1, 3);

      await expect(database.buscarProgressoPendente(usuarioId)).resolves.toEqual([
        expect.objectContaining({ atividade_id: 'variaveis', pontos: 50 }),
      ]);
    });
  });

  describe('mesclarProgressoRemoto', () => {
    let usuarioId: number;

    beforeEach(async () => {
      ({ id: usuarioId } = await database.vincularContaFirebase({
        uid: 'uid-ana',
        nome: 'Ana',
        email: 'ana@exemplo.com',
      }));
    });

    it('traz lições feitas em outro aparelho, com pontos e moedas', async () => {
      await database.mesclarProgressoRemoto(usuarioId, [
        { atividadeId: 'funcoes', pontos: 150, estrelas: 3, moedas: 3 },
      ]);

      await expect(database.buscarUsuario(usuarioId)).resolves.toMatchObject({
        pontos: 150,
        moedas: 3,
      });
      await expect(database.buscarProgresso(usuarioId)).resolves.toEqual([
        expect.objectContaining({ atividade_id: 'funcoes', pontos: 150, sincronizado: 1 }),
      ]);
    });

    it('fica com o melhor de cada lado e soma só a diferença', async () => {
      await database.registrarConclusao(usuarioId, 'condicionais', 60, 2, 1);
      await database.registrarConclusao(usuarioId, 'variaveis', 50, 1, 3);

      await database.mesclarProgressoRemoto(usuarioId, [
        { atividadeId: 'condicionais', pontos: 100, estrelas: 3, moedas: 2 },
        { atividadeId: 'variaveis', pontos: 25, estrelas: 1, moedas: 1 },
      ]);

      const progresso = await database.buscarProgresso(usuarioId);
      const porId = Object.fromEntries(progresso.map((linha) => [linha.atividade_id, linha]));

      // Nuvem melhor: adota e não precisa reenviar.
      expect(porId.condicionais).toMatchObject({ pontos: 100, estrelas: 3, sincronizado: 1 });
      // Local melhor: mantém e continua pendente para enviar.
      expect(porId.variaveis).toMatchObject({ pontos: 50, estrelas: 3, sincronizado: 0 });
      // 60 + 50 locais + 40 de diferença; moedas não são creditadas de novo.
      await expect(database.buscarUsuario(usuarioId)).resolves.toMatchObject({
        pontos: 150,
        moedas: 3,
      });
    });

    it('lista vazia não altera nada', async () => {
      await database.mesclarProgressoRemoto(usuarioId, []);
      await expect(database.buscarProgresso(usuarioId)).resolves.toEqual([]);
    });
  });
});
