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

      expect(versao?.user_version).toBe(5);
      expect(tabelas.map((t) => t.name)).toEqual(['progresso', 'sessoes', 'usuarios']);
      expect(colunasUsuario.map((c) => c.name)).toEqual(
        expect.arrayContaining(['avatar', 'pontos', 'moedas']),
      );
    });

    it('migra um banco na versão 3 preservando o progresso (na nova escala de pontos)', async () => {
      const antigo = new sqlite.SQLiteDatabase('educateach.db');
      await antigo.execAsync(`
        CREATE TABLE usuarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
          senha TEXT NOT NULL, tipo TEXT NOT NULL DEFAULT 'aluno',
          avatar TEXT NOT NULL DEFAULT 'padrao', pontos INTEGER NOT NULL DEFAULT 0,
          moedas INTEGER NOT NULL DEFAULT 0
        );
        CREATE TABLE progresso (
          usuario_id INTEGER NOT NULL, atividade_id TEXT NOT NULL,
          pontos INTEGER NOT NULL DEFAULT 0, tentativas INTEGER NOT NULL DEFAULT 1,
          concluida_em TEXT NOT NULL, sincronizado INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (usuario_id, atividade_id)
        );
        CREATE TABLE sessoes (
          token_hash TEXT PRIMARY KEY NOT NULL, usuario_id INTEGER NOT NULL,
          criada_em TEXT NOT NULL, expira_em TEXT NOT NULL
        );
        INSERT INTO usuarios (nome, email, senha, pontos) VALUES ('Ana', 'ana@exemplo.com', 'x', 10);
        INSERT INTO progresso (usuario_id, atividade_id, pontos, concluida_em)
        VALUES (1, 'comandos-basicos', 10, '2026-01-01');
        PRAGMA user_version = 3;
      `);
      sqlite.openDatabaseAsync.mockResolvedValueOnce(antigo);

      const progresso = await database.buscarProgresso(1);

      expect(progresso).toEqual([
        expect.objectContaining({ atividade_id: 'comandos-basicos', pontos: 50, estrelas: 0 }),
      ]);
      await expect(database.buscarUsuario(1)).resolves.toMatchObject({ pontos: 50 });
      const versao = await antigo.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
      expect(versao?.user_version).toBe(5);
    });

    it('na versão 5 reescala os pontos proporcionalmente e ajusta o total do usuário', async () => {
      const antigo = new sqlite.SQLiteDatabase('educateach.db');
      await antigo.execAsync(`
        CREATE TABLE usuarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
          senha TEXT NOT NULL, tipo TEXT NOT NULL DEFAULT 'aluno',
          avatar TEXT NOT NULL DEFAULT 'padrao', pontos INTEGER NOT NULL DEFAULT 0,
          moedas INTEGER NOT NULL DEFAULT 0
        );
        CREATE TABLE progresso (
          usuario_id INTEGER NOT NULL, atividade_id TEXT NOT NULL,
          pontos INTEGER NOT NULL DEFAULT 0, tentativas INTEGER NOT NULL DEFAULT 1,
          concluida_em TEXT NOT NULL, sincronizado INTEGER NOT NULL DEFAULT 1,
          estrelas INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (usuario_id, atividade_id)
        );
        CREATE TABLE sessoes (
          token_hash TEXT PRIMARY KEY NOT NULL, usuario_id INTEGER NOT NULL,
          criada_em TEXT NOT NULL, expira_em TEXT NOT NULL
        );
        -- Ana: 15 de 20 em condicionais, 30 de 30 em funcoes e 7 pontos de uma atividade antiga.
        INSERT INTO usuarios (nome, email, senha, pontos) VALUES ('Ana', 'ana@exemplo.com', 'x', 52);
        INSERT INTO progresso (usuario_id, atividade_id, pontos, concluida_em) VALUES
          (1, 'condicionais', 15, '2026-01-01'),
          (1, 'funcoes', 30, '2026-01-01'),
          (1, 'atividade-antiga', 7, '2026-01-01');
        -- Bia: só 1 ponto em variaveis; Caio nunca concluiu nada.
        INSERT INTO usuarios (nome, email, senha, pontos) VALUES ('Bia', 'bia@exemplo.com', 'x', 1);
        INSERT INTO progresso (usuario_id, atividade_id, pontos, concluida_em)
        VALUES (2, 'variaveis', 1, '2026-01-01');
        INSERT INTO usuarios (nome, email, senha, pontos) VALUES ('Caio', 'caio@exemplo.com', 'x', 0);
        PRAGMA user_version = 4;
      `);
      sqlite.openDatabaseAsync.mockResolvedValueOnce(antigo);

      const progressoAna = await database.buscarProgresso(1);
      const porAtividade = Object.fromEntries(
        progressoAna.map((linha) => [linha.atividade_id, linha]),
      );

      expect(porAtividade.condicionais).toMatchObject({ pontos: 75, sincronizado: 0 });
      expect(porAtividade.funcoes).toMatchObject({ pontos: 150, sincronizado: 0 });
      // Atividades fora da trilha atual não são tocadas.
      expect(porAtividade['atividade-antiga']).toMatchObject({ pontos: 7, sincronizado: 1 });
      await expect(database.buscarUsuario(1)).resolves.toMatchObject({ pontos: 75 + 150 + 7 });

      // 1 de 20 vira 2.5, arredondado para 3: concluir nunca vale zero.
      await expect(database.buscarProgresso(2)).resolves.toEqual([
        expect.objectContaining({ atividade_id: 'variaveis', pontos: 3 }),
      ]);
      await expect(database.buscarUsuario(2)).resolves.toMatchObject({ pontos: 3 });
      await expect(database.buscarUsuario(3)).resolves.toMatchObject({ pontos: 0 });

      const indice = await antigo.getFirstAsync<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type = 'index' AND name = 'idx_usuarios_pontos'",
      );
      expect(indice?.name).toBe('idx_usuarios_pontos');
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
        estrelas: 0,
      });
    });

    it('guarda as estrelas e mantém sempre a melhor', async () => {
      await database.registrarConclusao(usuarioId, 'condicionais', 12, 2, 2);
      await database.registrarConclusao(usuarioId, 'condicionais', 4, 2, 1);

      let [linha] = await database.buscarProgresso(usuarioId);
      expect(linha).toMatchObject({ estrelas: 2, pontos: 12, tentativas: 2 });

      await database.registrarConclusao(usuarioId, 'condicionais', 20, 2, 3);
      [linha] = await database.buscarProgresso(usuarioId);
      expect(linha).toMatchObject({ estrelas: 3, pontos: 20, tentativas: 3 });
    });

    it('limita estrelas fora do intervalo de 0 a 3', async () => {
      await database.registrarConclusao(usuarioId, 'condicionais', 10, 1, 9);

      const [linha] = await database.buscarProgresso(usuarioId);
      expect(linha.estrelas).toBe(3);
    });

    it('ignora linhas de progresso corrompidas ao ler', async () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      await database.registrarConclusao(usuarioId, 'condicionais', 10, 1, 2);
      await bancoAtual(sqlite).runAsync(
        `INSERT INTO progresso (usuario_id, atividade_id, pontos, tentativas, concluida_em, estrelas)
         VALUES (?, ?, ?, 1, ?, ?)`,
        [usuarioId, 'funcoes', -5, '2026-01-01', 1],
      );

      const progresso = await database.buscarProgresso(usuarioId);

      expect(progresso.map((linha) => linha.atividade_id)).toEqual(['condicionais']);
      jest.restoreAllMocks();
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

  describe('buscarRanking', () => {
    async function cadastrarComPontos(nome: string, pontos: number): Promise<number> {
      const id = await database.cadastrarUsuario(nome, `${nome.toLowerCase()}@exemplo.com`, SENHA);
      if (pontos > 0) {
        await database.registrarConclusao(id, 'comandos-basicos', pontos, 1);
      }
      return id;
    }

    it('ordena por pontos e desempata pelo nome, sem expor e-mail', async () => {
      await cadastrarComPontos('Carla', 100);
      await cadastrarComPontos('bruno', 150);
      await cadastrarComPontos('Ana', 100);

      const { lideres, total } = await database.buscarRanking(null, 10);

      expect(total).toBe(3);
      expect(lideres.map((linha) => [linha.nome, linha.pontos])).toEqual([
        ['bruno', 150],
        ['Ana', 100],
        ['Carla', 100],
      ]);
      expect(Object.keys(lideres[0]).sort()).toEqual(['avatar', 'id', 'nome', 'pontos']);
    });

    it('informa posição e quem está logo acima, mesmo fora dos líderes', async () => {
      await cadastrarComPontos('Ana', 150);
      await cadastrarComPontos('Bia', 100);
      await cadastrarComPontos('Caio', 100);
      const eu = await cadastrarComPontos('Davi', 50);

      const resumo = await database.buscarRanking(eu, 2);

      expect(resumo.lideres.map((linha) => linha.nome)).toEqual(['Ana', 'Bia']);
      expect(resumo.usuario).toEqual({
        linha: expect.objectContaining({ id: eu, nome: 'Davi', pontos: 50 }),
        posicao: 4,
        acima: expect.objectContaining({ nome: 'Caio', pontos: 100 }),
      });
    });

    it('empatados dividem a posição e o líder não tem ninguém acima', async () => {
      const ana = await cadastrarComPontos('Ana', 100);
      const bia = await cadastrarComPontos('Bia', 100);

      const deAna = await database.buscarRanking(ana, 10);
      const deBia = await database.buscarRanking(bia, 10);

      expect(deAna.usuario).toMatchObject({ posicao: 1, acima: null });
      expect(deBia.usuario).toMatchObject({ posicao: 1, acima: null });
    });

    it('reflete pontos novos sem contar a mesma lição duas vezes', async () => {
      const ana = await cadastrarComPontos('Ana', 40);
      await cadastrarComPontos('Bia', 45);

      await database.registrarConclusao(ana, 'comandos-basicos', 50, 1);
      await database.registrarConclusao(ana, 'comandos-basicos', 50, 1);

      const resumo = await database.buscarRanking(ana, 10);
      expect(resumo.usuario).toMatchObject({ posicao: 1, linha: { pontos: 50 } });
    });

    it('limita a quantidade de linhas e trata limites inválidos', async () => {
      for (const nome of ['Ana', 'Bia', 'Caio']) await cadastrarComPontos(nome, 10);

      await expect(database.buscarRanking(null, 2)).resolves.toMatchObject({
        lideres: [expect.anything(), expect.anything()],
      });
      const comZero = await database.buscarRanking(null, 0);
      expect(comZero.lideres).toHaveLength(1);
      const comNaN = await database.buscarRanking(null, Number.NaN);
      expect(comNaN.lideres).toHaveLength(1);
    });

    it('devolve lista vazia sem usuários e null para usuário inexistente', async () => {
      await expect(database.buscarRanking(99, 10)).resolves.toEqual({
        lideres: [],
        total: 0,
        usuario: null,
      });
    });
  });
});
