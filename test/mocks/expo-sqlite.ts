/// <reference types="node" />
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';

/**
 * Implementação em memória do subconjunto assíncrono do expo-sqlite usado em db/,
 * apoiada no SQLite embutido do Node (node:sqlite, Node >= 22.13).
 * Cada `openDatabaseAsync` abre um banco novo e vazio.
 */
type BindParams = SQLInputValue[];

export type SQLiteRunResult = {
  lastInsertRowId: number;
  changes: number;
};

export class SQLiteDatabase {
  readonly databasePath: string;

  private readonly conexao: DatabaseSync;

  constructor(databasePath: string) {
    this.databasePath = databasePath;
    this.conexao = new DatabaseSync(':memory:');
  }

  async execAsync(source: string): Promise<void> {
    this.conexao.exec(source);
  }

  async runAsync(source: string, params: BindParams = []): Promise<SQLiteRunResult> {
    const resultado = this.conexao.prepare(source).run(...params);

    return {
      lastInsertRowId: Number(resultado.lastInsertRowid),
      changes: Number(resultado.changes),
    };
  }

  async getFirstAsync<T>(source: string, params: BindParams = []): Promise<T | null> {
    const linha = this.conexao.prepare(source).get(...params);

    return (linha as T | undefined) ?? null;
  }

  async getAllAsync<T>(source: string, params: BindParams = []): Promise<T[]> {
    return this.conexao.prepare(source).all(...params) as T[];
  }

  async withTransactionAsync(task: () => Promise<void>): Promise<void> {
    this.conexao.exec('BEGIN');

    try {
      await task();
      this.conexao.exec('COMMIT');
    } catch (error) {
      this.conexao.exec('ROLLBACK');
      throw error;
    }
  }

  async closeAsync(): Promise<void> {
    this.conexao.close();
  }
}

/** Bancos abertos desde o último `jest.resetModules()`, para inspeção nos testes. */
export const bancosAbertos: SQLiteDatabase[] = [];

export const openDatabaseAsync = jest.fn(async (databaseName: string): Promise<SQLiteDatabase> => {
  const db = new SQLiteDatabase(databaseName);
  bancosAbertos.push(db);
  return db;
});
