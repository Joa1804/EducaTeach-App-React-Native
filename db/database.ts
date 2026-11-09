import * as SQLite from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';

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

const NOME_BANCO = 'educateach.db';

const VERSAO_DO_BANCO = 2;

const COLUNA_USUARIO =
    'id, nome, email, tipo, avatar, pontos, moedas';

let dbPromise: Promise<SQLiteDatabase> | null = null;

let inicializacao: Promise<void> | null = null;


function obterConexao(): Promise<SQLiteDatabase> {
    if (!dbPromise) {
        dbPromise = SQLite.openDatabaseAsync(NOME_BANCO);
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

export async function autenticar(
    email: string,
    senha: string
): Promise<Usuario | null> {

    const db = await abrirBancoDeDados();

    const usuario = await db.getFirstAsync<Usuario>(
        `SELECT ${COLUNA_USUARIO}
         FROM usuarios
         WHERE email = ? AND senha = ?`,
        [email.trim().toLowerCase(), senha]
    );

    return usuario ?? null;
}

export async function cadastrarUsuario(
    nome: string,
    email: string,
    senha: string
): Promise<number> {

    const db = await abrirBancoDeDados();

    const resultado = await db.runAsync(
        `INSERT INTO usuarios (nome, email, senha, tipo)
         VALUES (?, ?, ?, ?)`,
        [nome.trim(), email.trim().toLowerCase(), senha, 'aluno']
    );

    return resultado.lastInsertRowId;
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
