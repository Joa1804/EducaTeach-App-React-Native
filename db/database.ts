import * as SQLite from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';
import {
    gerarHashSenha,
    gerarTokenSessao,
    hashToken,
    simularVerificacao,
    verificarSenha,
} from '../lib/security/password';

export type Usuario = {
    id: number;
    nome: string;
    email: string;
    tipo: 'aluno' | 'professor';
    avatar: string;
    pontos: number;
    moedas: number;
};

export type Progresso = {
    usuario_id: number;
    atividade_id: string;
    pontos: number;
    tentativas: number;
    concluida_em: string;
    sincronizado: number;
};

export type SessaoCriada = {
    token: string;
    expiraEm: string;
};

/** Lançado quando o e-mail informado no cadastro já pertence a outra conta. */
export class EmailJaCadastradoError extends Error {
    constructor() {
        super('Este e-mail já está cadastrado.');
        this.name = 'EmailJaCadastradoError';
    }
}

const NOME_BANCO = 'educateach.db';

const VERSAO_DO_BANCO = 3;

/** Tempo de vida de uma sessão local: 30 dias. */
const DURACAO_SESSAO_MS = 30 * 24 * 60 * 60 * 1000;

const COLUNA_USUARIO =
    'id, nome, email, tipo, avatar, pontos, moedas';

let dbPromise: Promise<SQLiteDatabase> | null = null;

let inicializacao: Promise<void> | null = null;


function obterConexao(): Promise<SQLiteDatabase> {
    if (!dbPromise) {
        // Se a abertura falhar, descarta a promise rejeitada para permitir nova tentativa.
        dbPromise = SQLite.openDatabaseAsync(NOME_BANCO).catch((error: unknown) => {
            dbPromise = null;
            throw error;
        });
    }

    return dbPromise;
}

async function migrar(db: SQLiteDatabase): Promise<void> {

    const linha = await db.getFirstAsync<{ user_version: number }>(
        'PRAGMA user_version'
    );

    const versao = linha?.user_version ?? 0;

    if (versao < 1) {

        await db.withTransactionAsync(async () => {

            await db.execAsync(`
                CREATE TABLE IF NOT EXISTS usuarios (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nome TEXT NOT NULL,
                    email TEXT NOT NULL UNIQUE,
                    senha TEXT NOT NULL,
                    tipo TEXT NOT NULL DEFAULT 'aluno'
                );
            `);

        });
    }

    if (versao < 2) {

        await db.withTransactionAsync(async () => {

            await db.execAsync(`
                ALTER TABLE usuarios
                ADD COLUMN avatar TEXT NOT NULL DEFAULT 'padrao';

                ALTER TABLE usuarios
                ADD COLUMN pontos INTEGER NOT NULL DEFAULT 0;

                ALTER TABLE usuarios
                ADD COLUMN moedas INTEGER NOT NULL DEFAULT 0;

                CREATE TABLE IF NOT EXISTS progresso (
                    usuario_id INTEGER NOT NULL,
                    atividade_id TEXT NOT NULL,
                    pontos INTEGER NOT NULL DEFAULT 0,
                    tentativas INTEGER NOT NULL DEFAULT 1,
                    concluida_em TEXT NOT NULL,
                    sincronizado INTEGER NOT NULL DEFAULT 0,

                    PRIMARY KEY (usuario_id, atividade_id),

                    FOREIGN KEY (usuario_id)
                    REFERENCES usuarios(id)
                    ON DELETE CASCADE
                );
            `);

        });
    }

    if (versao < 3) {

        await db.withTransactionAsync(async () => {

            // Guarda apenas o hash do token; o token em si fica no SecureStore do aparelho.
            await db.execAsync(`
                CREATE TABLE IF NOT EXISTS sessoes (
                    token_hash TEXT PRIMARY KEY NOT NULL,
                    usuario_id INTEGER NOT NULL,
                    criada_em TEXT NOT NULL,
                    expira_em TEXT NOT NULL,

                    FOREIGN KEY (usuario_id)
                    REFERENCES usuarios(id)
                    ON DELETE CASCADE
                );

                CREATE INDEX IF NOT EXISTS idx_sessoes_usuario
                ON sessoes (usuario_id);
            `);

        });
    }

    await db.execAsync(
        `PRAGMA user_version = ${VERSAO_DO_BANCO};`
    );
}

export function iniciarBancoDeDados(): Promise<void> {

    if (!inicializacao) {

        inicializacao = (async () => {

            const db = await obterConexao();

            await db.execAsync('PRAGMA foreign_keys = ON;');

            await migrar(db);

        })().catch((error) => {

            inicializacao = null;

            throw error;

        });
    }

    return inicializacao;
}

async function abrirBancoDeDados(): Promise<SQLiteDatabase> {

    await iniciarBancoDeDados();

    return obterConexao();
}

function normalizarEmail(email: string): string {
    return email.trim().toLowerCase();
}

/**
 * Confere e-mail e senha. Retorna `null` tanto para e-mail inexistente quanto
 * para senha errada, para não revelar quais contas existem.
 * Senhas legadas em texto puro são convertidas para hash no primeiro login válido.
 */
export async function autenticar(
    email: string,
    senha: string
): Promise<Usuario | null> {

    const db = await abrirBancoDeDados();

    const credencial = await db.getFirstAsync<{ id: number; senha: string }>(
        `SELECT id, senha
         FROM usuarios
         WHERE email = ?`,
        [normalizarEmail(email)]
    );

    if (!credencial) {
        await simularVerificacao(senha);
        return null;
    }

    const { valida, precisaAtualizar } = await verificarSenha(senha, credencial.senha);

    if (!valida) return null;

    if (precisaAtualizar) {
        const novoHash = await gerarHashSenha(senha);

        await db.runAsync(
            'UPDATE usuarios SET senha = ? WHERE id = ?',
            [novoHash, credencial.id]
        );
    }

    return buscarUsuario(credencial.id);
}

export async function cadastrarUsuario(
    nome: string,
    email: string,
    senha: string
): Promise<number> {

    const db = await abrirBancoDeDados();

    const senhaHash = await gerarHashSenha(senha);

    try {
        const resultado = await db.runAsync(
            `INSERT INTO usuarios (nome, email, senha, tipo)
             VALUES (?, ?, ?, ?)`,
            [nome.trim(), normalizarEmail(email), senhaHash, 'aluno']
        );

        return resultado.lastInsertRowId;
    } catch (error) {
        const mensagem = error instanceof Error ? error.message : String(error);

        if (mensagem.includes('UNIQUE constraint failed')) {
            throw new EmailJaCadastradoError();
        }

        throw error;
    }
}

/** Cria uma sessão para o usuário e devolve o token em claro (só existe na memória e no SecureStore). */
export async function criarSessao(
    usuarioId: number
): Promise<SessaoCriada> {

    const db = await abrirBancoDeDados();

    const token = gerarTokenSessao();
    const tokenHash = await hashToken(token);
    const agora = new Date();
    const expiraEm = new Date(agora.getTime() + DURACAO_SESSAO_MS).toISOString();

    await db.withTransactionAsync(async () => {
        // Aproveita para limpar sessões vencidas do usuário.
        await db.runAsync(
            'DELETE FROM sessoes WHERE usuario_id = ? AND expira_em <= ?',
            [usuarioId, agora.toISOString()]
        );

        await db.runAsync(
            `INSERT INTO sessoes (token_hash, usuario_id, criada_em, expira_em)
             VALUES (?, ?, ?, ?)`,
            [tokenHash, usuarioId, agora.toISOString(), expiraEm]
        );
    });

    return { token, expiraEm };
}

/** Retorna o dono de uma sessão válida, ou `null` se o token não existe ou expirou. */
export async function buscarUsuarioPorSessao(
    token: string
): Promise<Usuario | null> {

    const db = await abrirBancoDeDados();

    const tokenHash = await hashToken(token);

    const usuario = await db.getFirstAsync<Usuario>(
        `SELECT u.id, u.nome, u.email, u.tipo, u.avatar, u.pontos, u.moedas
         FROM sessoes s
         JOIN usuarios u ON u.id = s.usuario_id
         WHERE s.token_hash = ? AND s.expira_em > ?`,
        [tokenHash, new Date().toISOString()]
    );

    if (!usuario) {
        await db.runAsync('DELETE FROM sessoes WHERE token_hash = ?', [tokenHash]);
        return null;
    }

    return usuario;
}

export async function encerrarSessao(
    token: string
): Promise<void> {

    const db = await abrirBancoDeDados();

    const tokenHash = await hashToken(token);

    await db.runAsync('DELETE FROM sessoes WHERE token_hash = ?', [tokenHash]);
}

export async function buscarUsuario(
    id: number
): Promise<Usuario | null> {

    const db = await abrirBancoDeDados();

    const usuario = await db.getFirstAsync<Usuario>(
        `SELECT ${COLUNA_USUARIO}
         FROM usuarios
         WHERE id = ?`,
        [id]
    );

    return usuario ?? null;
}

export async function buscarProgresso(
    usuarioId: number
): Promise<Progresso[]> {

    const db = await abrirBancoDeDados();

    return db.getAllAsync<Progresso>(
        'SELECT * FROM progresso WHERE usuario_id = ?',
        [usuarioId]
    );
}

export async function registrarConclusao(
    usuarioId: number,
    atividadeId: string,
    pontos: number,
    moedas: number
): Promise<{ primeiraVez: boolean; pontosGanhos: number }> {

    const db = await abrirBancoDeDados();

    let resultado = {
        primeiraVez: false,
        pontosGanhos: 0,
    };

    await db.withTransactionAsync(async () => {

        const agora = new Date().toISOString();

        const existente = await db.getFirstAsync<Progresso>(
            `SELECT *
             FROM progresso
             WHERE usuario_id = ? AND atividade_id = ?`,
            [usuarioId, atividadeId]
        );

        if (!existente) {
            await db.runAsync(
                `INSERT INTO progresso (
                    usuario_id,
                    atividade_id,
                    pontos,
                    tentativas,
                    concluida_em,
                    sincronizado
                )
                VALUES (?, ?, ?, 1, ?, 0)`,
                [usuarioId, atividadeId, pontos, agora]
            );

            await db.runAsync(
                `UPDATE usuarios
                 SET pontos = pontos + ?, moedas = moedas + ?
                 WHERE id = ?`,
                [pontos, moedas, usuarioId]
            );

            resultado = {
                primeiraVez: true,
                pontosGanhos: pontos,
            };

        } else {

            const melhora = Math.max(
                0,
                pontos - existente.pontos
            );

            await db.runAsync(
                `UPDATE progresso
                 SET tentativas = tentativas + 1,
                     pontos = pontos + ?,
                     concluida_em = ?,
                     sincronizado = 0
                 WHERE usuario_id = ? AND atividade_id = ?`,
                [melhora, agora, usuarioId, atividadeId]
            );

            if (melhora > 0) {

                await db.runAsync(
                    `UPDATE usuarios
                     SET pontos = pontos + ?
                     WHERE id = ?`,
                    [melhora, usuarioId]
                );
            }

            resultado = {
                primeiraVez: false,
                pontosGanhos: melhora,
            };
        }

    });

    return resultado;
}
