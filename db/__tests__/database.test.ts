import type * as DatabaseModule from '../database';
import type * as SQLiteMock from '../../test/mocks/expo-sqlite';

type Contexto = {
  database: typeof DatabaseModule;
  sqlite: typeof SQLiteMock;
};

/**
 * database.ts guarda a conexão e a inicialização em variáveis de módulo.
 * Recarregar os módulos a cada teste garante um banco em memória novo e isolado.
 */
function carregarModulos(): Contexto {
  jest.resetModules();

  return {
    sqlite: jest.requireMock<typeof SQLiteMock>('expo-sqlite'),
    database: jest.requireActual<typeof DatabaseModule>('../database'),
  };
}

function bancoAtual(sqlite: typeof SQLiteMock): SQLiteMock.SQLiteDatabase {
  const db = sqlite.bancosAbertos.at(-1);
  if (!db) throw new Error('Nenhum banco foi aberto.');
  return db;
}

const SENHA = 'SenhaForte#123';

describe('db/database', () => {
  let database: typeof DatabaseModule;
  let sqlite: typeof SQLiteMock;

  beforeEach(() => {
    ({ database, sqlite } = carregarModulos());
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('iniciarBancoDeDados', () => {
    it('aplica todas as migrações e grava a versão do schema', async () => {
      await database.iniciarBancoDeDados();
      const db = bancoAtual(sqlite);

      const versao = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
      const tabelas = await db.getAllAsync<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
      );
      const colunasUsuario = await db.getAllAsync<{ name: string }>('PRAGMA table_info(usuarios)');

      expect(versao?.user_version).toBe(3);
      expect(tabelas.map((t) => t.name)).toEqual(['progresso', 'sessoes', 'usuarios']);
      expect(colunasUsuario.map((c) => c.name)).toEqual(
        expect.arrayContaining(['avatar', 'pontos', 'moedas']),
      );
    });

    it('abre uma única conexão mesmo com chamadas concorrentes', async () => {
      await Promise.all([
        database.iniciarBancoDeDados(),
        database.iniciarBancoDeDados(),
        database.buscarUsuario(1),
      ]);

      expect(sqlite.openDatabaseAsync).toHaveBeenCalledTimes(1);
      expect(sqlite.openDatabaseAsync).toHaveBeenCalledWith('educateach.db');
    });

    it('ativa as foreign keys', async () => {
      await database.iniciarBancoDeDados();

      const pragma = await bancoAtual(sqlite).getFirstAsync<{
        foreign_keys: number;
      }>('PRAGMA foreign_keys');

      expect(pragma?.foreign_keys).toBe(1);
    });

    it('permite tentar de novo depois de uma falha na inicialização', async () => {
      sqlite.openDatabaseAsync.mockRejectedValueOnce(new Error('disco cheio'));

      await expect(database.iniciarBancoDeDados()).rejects.toThrow('disco cheio');
      await expect(database.iniciarBancoDeDados()).resolves.toBeUndefined();
    });
  });

  describe('cadastrarUsuario', () => {
    it('normaliza nome e e-mail e nunca grava a senha em texto puro', async () => {
      const id = await database.cadastrarUsuario('  Ana  ', '  Ana@Exemplo.COM ', SENHA);

      const linha = await bancoAtual(sqlite).getFirstAsync<{
        nome: string;
        email: string;
        senha: string;
        tipo: string;
      }>('SELECT nome, email, senha, tipo FROM usuarios WHERE id = ?', [id]);

      expect(linha).toMatchObject({
        nome: 'Ana',
        email: 'ana@exemplo.com',
        tipo: 'aluno',
      });
      expect(linha?.senha).not.toContain(SENHA);
      expect(linha?.senha).toMatch(/^sha256i\$\d+\$[0-9a-f]{32}\$[0-9a-f]{64}$/);
    });

    it('cria o usuário com pontos e moedas zerados', async () => {
      const id = await database.cadastrarUsuario('Ana', 'ana@exemplo.com', SENHA);

      await expect(database.buscarUsuario(id)).resolves.toEqual({
        id,
        nome: 'Ana',
        email: 'ana@exemplo.com',
        tipo: 'aluno',
        avatar: 'padrao',
        pontos: 0,
        moedas: 0,
      });
    });

    it('lança EmailJaCadastradoError para e-mail repetido, ignorando maiúsculas', async () => {
      await database.cadastrarUsuario('Ana', 'ana@exemplo.com', SENHA);

      await expect(
        database.cadastrarUsuario('Outra Ana', 'ANA@exemplo.com', 'OutraSenha#1'),
      ).rejects.toBeInstanceOf(database.EmailJaCadastradoError);
    });
  });

  describe('autenticar', () => {
    it('retorna o usuário quando e-mail e senha conferem', async () => {
      const id = await database.cadastrarUsuario('Ana', 'ana@exemplo.com', SENHA);

      const usuario = await database.autenticar(' ANA@exemplo.com ', SENHA);

      expect(usuario?.id).toBe(id);
      expect(usuario).not.toHaveProperty('senha');
    });

    it('retorna null para senha errada', async () => {
      await database.cadastrarUsuario('Ana', 'ana@exemplo.com', SENHA);

      await expect(database.autenticar('ana@exemplo.com', 'errada')).resolves.toBeNull();
    });

    it('retorna null para e-mail inexistente', async () => {
      await expect(database.autenticar('ninguem@exemplo.com', SENHA)).resolves.toBeNull();
    });

    it('converte senha legada em texto puro para hash no primeiro login válido', async () => {
      await database.iniciarBancoDeDados();
      const db = bancoAtual(sqlite);
      const { lastInsertRowId } = await db.runAsync(
        'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
        ['Legado', 'legado@exemplo.com', SENHA],
      );

      const usuario = await database.autenticar('legado@exemplo.com', SENHA);
      const linha = await db.getFirstAsync<{ senha: string }>(
        'SELECT senha FROM usuarios WHERE id = ?',
        [lastInsertRowId],
      );

      expect(usuario?.id).toBe(lastInsertRowId);
      expect(linha?.senha.startsWith('sha256i$')).toBe(true);
      await expect(database.autenticar('legado@exemplo.com', SENHA)).resolves.not.toBeNull();
    });
  });

  describe('sessões', () => {
    it('cria uma sessão e encontra o dono pelo token', async () => {
      const id = await database.cadastrarUsuario('Ana', 'ana@exemplo.com', SENHA);

      const { token, expiraEm } = await database.criarSessao(id);
      const usuario = await database.buscarUsuarioPorSessao(token);

      expect(token).toMatch(/^[0-9a-f]{64}$/);
      expect(new Date(expiraEm).getTime()).toBeGreaterThan(Date.now());
      expect(usuario?.id).toBe(id);
    });

    it('guarda apenas o hash do token no banco', async () => {
      const id = await database.cadastrarUsuario('Ana', 'ana@exemplo.com', SENHA);
      const { token } = await database.criarSessao(id);

      const linhas = await bancoAtual(sqlite).getAllAsync<{
        token_hash: string;
      }>('SELECT token_hash FROM sessoes');

      expect(linhas).toHaveLength(1);
      expect(linhas[0]?.token_hash).not.toBe(token);
    });

    it('retorna null para token desconhecido', async () => {
      await expect(database.buscarUsuarioPorSessao('token-inexistente')).resolves.toBeNull();
    });

    it('invalida a sessão ao encerrar', async () => {
      const id = await database.cadastrarUsuario('Ana', 'ana@exemplo.com', SENHA);
      const { token } = await database.criarSessao(id);

      await database.encerrarSessao(token);

      await expect(database.buscarUsuarioPorSessao(token)).resolves.toBeNull();
    });

    it('rejeita e remove sessão expirada', async () => {
      jest.useFakeTimers({
        now: new Date('2026-01-01T00:00:00Z'),
        advanceTimers: true,
      });
      const id = await database.cadastrarUsuario('Ana', 'ana@exemplo.com', SENHA);
      const { token } = await database.criarSessao(id);

      jest.setSystemTime(new Date('2026-02-15T00:00:00Z'));

      await expect(database.buscarUsuarioPorSessao(token)).resolves.toBeNull();
      const restantes = await bancoAtual(sqlite).getFirstAsync<{
        total: number;
      }>('SELECT COUNT(*) AS total FROM sessoes');
      expect(restantes?.total).toBe(0);
    });

    it('limpa sessões vencidas do usuário ao criar uma nova', async () => {
      jest.useFakeTimers({
        now: new Date('2026-01-01T00:00:00Z'),
        advanceTimers: true,
      });
      const id = await database.cadastrarUsuario('Ana', 'ana@exemplo.com', SENHA);
      await database.criarSessao(id);

      jest.setSystemTime(new Date('2026-03-01T00:00:00Z'));
      await database.criarSessao(id);

      const restantes = await bancoAtual(sqlite).getFirstAsync<{
        total: number;
      }>('SELECT COUNT(*) AS total FROM sessoes');
      expect(restantes?.total).toBe(1);
    });
  });

  describe('registrarConclusao e buscarProgresso', () => {
    let usuarioId: number;

    beforeEach(async () => {
      usuarioId = await database.cadastrarUsuario('Ana', 'ana@exemplo.com', SENHA);
    });

    it('na primeira conclusão credita pontos e moedas', async () => {
      const resultado = await database.registrarConclusao(usuarioId, 'condicionais', 15, 2);

      expect(resultado).toEqual({ primeiraVez: true, pontosGanhos: 15 });
      await expect(database.buscarUsuario(usuarioId)).resolves.toMatchObject({
        pontos: 15,
        moedas: 2,
      });

      const progresso = await database.buscarProgresso(usuarioId);
      expect(progresso).toHaveLength(1);
      expect(progresso[0]).toMatchObject({
        usuario_id: usuarioId,
        atividade_id: 'condicionais',
        pontos: 15,
        tentativas: 1,
        sincronizado: 0,
      });
    });

    it('ao repetir com pontuação maior credita só a diferença e não dá moedas de novo', async () => {
      await database.registrarConclusao(usuarioId, 'condicionais', 10, 2);

      const resultado = await database.registrarConclusao(usuarioId, 'condicionais', 18, 2);

      expect(resultado).toEqual({ primeiraVez: false, pontosGanhos: 8 });
      await expect(database.buscarUsuario(usuarioId)).resolves.toMatchObject({
        pontos: 18,
        moedas: 2,
      });
      const [linha] = await database.buscarProgresso(usuarioId);
      expect(linha).toMatchObject({ pontos: 18, tentativas: 2 });
    });

    it('ao repetir com pontuação menor não altera os pontos, só as tentativas', async () => {
      await database.registrarConclusao(usuarioId, 'condicionais', 20, 2);

      const resultado = await database.registrarConclusao(usuarioId, 'condicionais', 5, 2);

      expect(resultado).toEqual({ primeiraVez: false, pontosGanhos: 0 });
      await expect(database.buscarUsuario(usuarioId)).resolves.toMatchObject({
        pontos: 20,
      });
      const [linha] = await database.buscarProgresso(usuarioId);
      expect(linha).toMatchObject({ pontos: 20, tentativas: 2 });
    });

    it('desfaz tudo (rollback) se a transação falhar no meio', async () => {
      const db = bancoAtual(sqlite);
      const runOriginal = db.runAsync.bind(db);
      jest.spyOn(db, 'runAsync').mockImplementation(async (sql, params) => {
        if (sql.includes('UPDATE usuarios')) throw new Error('falha simulada');
        return runOriginal(sql, params);
      });

      await expect(database.registrarConclusao(usuarioId, 'condicionais', 15, 2)).rejects.toThrow(
        'falha simulada',
      );

      jest.restoreAllMocks();
      await expect(database.buscarProgresso(usuarioId)).resolves.toEqual([]);
      await expect(database.buscarUsuario(usuarioId)).resolves.toMatchObject({
        pontos: 0,
      });
    });

    it('isola o progresso por usuário', async () => {
      const outroId = await database.cadastrarUsuario('Bia', 'bia@exemplo.com', SENHA);
      await database.registrarConclusao(usuarioId, 'condicionais', 10, 1);

      await expect(database.buscarProgresso(outroId)).resolves.toEqual([]);
    });

    it('apaga o progresso em cascata quando o usuário é removido', async () => {
      await database.registrarConclusao(usuarioId, 'condicionais', 10, 1);

      await bancoAtual(sqlite).runAsync('DELETE FROM usuarios WHERE id = ?', [usuarioId]);

      await expect(database.buscarProgresso(usuarioId)).resolves.toEqual([]);
    });
  });
});
