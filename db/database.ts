import * as SQLite from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';
import { z } from 'zod';
import {
    gerarHashSenha,
    gerarTokenSessao,
    hashToken,
    simularVerificacao,
    verificarSenha,
} from '../lib/security/password';
import { limiteSeguro, type LinhaRanking, type ResumoRanking } from '../lib/ranking/tipos';

export type Usuario = {
    id: number;
    nome: string;
    email: string;
    tipo: 'aluno' | 'professor';
    avatar: string;
    pontos: number;
    moedas: number;
    /** Uid da conta no Firebase Auth vinculada a este perfil local, se houver. */
    firebase_uid: string | null;
};

/** Linha da tabela `progresso`, validada ao ler do banco. */
const progressoSchema = z.object({
    usuario_id: z.number().int(),
    atividade_id: z.string().min(1),
    pontos: z.number().int().min(0),
    tentativas: z.number().int().min(1),
    concluida_em: z.string().min(1),
    sincronizado: z.number().int(),
    /** Melhor número de estrelas (0 a 3) obtido na atividade. */
    estrelas: z.number().int().min(0).max(3),
});

export type Progresso = z.infer<typeof progressoSchema>;

/** Linha da classificação lida do banco (sem dados sensíveis como e-mail). */
const linhaRankingSchema = z.object({
    id: z.union([z.string().min(1), z.number().int().transform(String)]),
    nome: z.string(),
    avatar: z.string(),
    pontos: z.number().int().min(0),
}) satisfies z.ZodType<LinhaRanking, unknown>;

export {
    LIMITE_MAXIMO_RANKING,
    type LinhaRanking,
    type PosicaoUsuarioRanking,
    type ResumoRanking,
} from '../lib/ranking/tipos';

/**
 * Pontuação máxima de cada lição antes (v4) e depois (v5) da troca para pontos
 * por dificuldade. Fica congelada aqui porque descreve o passado: mudar o
 * conteúdo da trilha no futuro não pode alterar o que esta migração fez.
 */
const REESCALA_PONTOS_V5: readonly { atividadeId: string; antes: number; depois: number }[] = [
    { atividadeId: 'comandos-basicos', antes: 10, depois: 50 },
    { atividadeId: 'variaveis', antes: 20, depois: 50 },
    { atividadeId: 'condicionais', antes: 20, depois: 100 },
    { atividadeId: 'repeticoes-loops', antes: 20, depois: 100 },
    { atividadeId: 'funcoes', antes: 30, depois: 150 },
];

export type ResultadoRegistro = {
    primeiraVez: boolean;
    pontosGanhos: number;
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

const VERSAO_DO_BANCO = 6;

/** Tempo de vida de uma sessão local: 30 dias. */
const DURACAO_SESSAO_MS = 30 * 24 * 60 * 60 * 1000;

const COLUNA_USUARIO =
    'id, nome, email, tipo, avatar, pontos, moedas, firebase_uid';

/**
 * Valor gravado em `senha` para perfis criados a partir de uma conta Firebase.
 * Nunca confere com nenhuma senha (o login local o recusa explicitamente).
 */
const SENHA_CONTA_FIREBASE = '';

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

    if (versao < 4) {

        await db.withTransactionAsync(async () => {

            // Estrelas das lições da trilha (0 = registro antigo, sem avaliação).
            await db.execAsync(`
                ALTER TABLE progresso
                ADD COLUMN estrelas INTEGER NOT NULL DEFAULT 0;
            `);

        });
    }

    if (versao < 5) {

        await db.withTransactionAsync(async () => {

            // Converte o melhor resultado de cada lição para a nova escala,
            // mantendo a proporção (ex.: 15 de 20 vira 75 de 100).
            for (const { atividadeId, antes, depois } of REESCALA_PONTOS_V5) {

                const novoValor = `CASE
                    WHEN p.pontos <= 0 THEN 0
                    ELSE MIN(${depois}, MAX(1, CAST(ROUND(p.pontos * ${depois} * 1.0 / ${antes}) AS INTEGER)))
                END`;

                // Primeiro ajusta o total do usuário pela diferença; depois a linha do progresso.
                await db.runAsync(
                    `UPDATE usuarios
                     SET pontos = MAX(0, pontos + COALESCE((
                         SELECT ${novoValor} - p.pontos
                         FROM progresso p
                         WHERE p.usuario_id = usuarios.id AND p.atividade_id = ?
                     ), 0))`,
                    [atividadeId]
                );

                await db.runAsync(
                    `UPDATE progresso AS p
                     SET pontos = ${novoValor}, sincronizado = 0
                     WHERE p.atividade_id = ?`,
                    [atividadeId]
                );
            }

            await db.execAsync(`
                CREATE INDEX IF NOT EXISTS idx_usuarios_pontos
                ON usuarios (pontos DESC);
            `);

        });
    }

    if (versao < 6) {

        await db.withTransactionAsync(async () => {

            // Liga o perfil local à conta do Firebase Auth (null = conta só local).
            await db.execAsync(`
                ALTER TABLE usuarios
                ADD COLUMN firebase_uid TEXT;

                CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_firebase_uid
                ON usuarios (firebase_uid)
                WHERE firebase_uid IS NOT NULL;

                CREATE INDEX IF NOT EXISTS idx_progresso_pendente
                ON progresso (usuario_id)
                WHERE sincronizado = 0;
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

    // Perfis de contas Firebase não têm senha local: só entram pelo Firebase Auth.
    if (!credencial || credencial.senha === SENHA_CONTA_FIREBASE) {
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
        `SELECT u.id, u.nome, u.email, u.tipo, u.avatar, u.pontos, u.moedas, u.firebase_uid
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

    const linhas = await db.getAllAsync<unknown>(
        `SELECT usuario_id, atividade_id, pontos, tentativas, concluida_em, sincronizado, estrelas
         FROM progresso
         WHERE usuario_id = ?`,
        [usuarioId]
    );

    // Descarta linhas corrompidas em vez de quebrar a trilha inteira.
    return linhas.flatMap((linha) => {
        const resultado = progressoSchema.safeParse(linha);
        if (!resultado.success) {
            console.warn('Linha de progresso inválida ignorada:', resultado.error.issues);
            return [];
        }
        return [resultado.data];
    });
}

/**
 * Registra a conclusão de uma atividade numa transação. Guarda sempre a melhor
 * pontuação e o melhor número de estrelas; moedas só são creditadas na primeira vez.
 */
export async function registrarConclusao(
    usuarioId: number,
    atividadeId: string,
    pontos: number,
    moedas: number,
    estrelas = 0
): Promise<ResultadoRegistro> {

    const db = await abrirBancoDeDados();

    const estrelasValidas = Math.min(3, Math.max(0, Math.round(estrelas)));

    let resultado: ResultadoRegistro = {
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
                    sincronizado,
                    estrelas
                )
                VALUES (?, ?, ?, 1, ?, 0, ?)`,
                [usuarioId, atividadeId, pontos, agora, estrelasValidas]
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
                     estrelas = MAX(estrelas, ?),
                     concluida_em = ?,
                     sincronizado = 0
                 WHERE usuario_id = ? AND atividade_id = ?`,
                [melhora, estrelasValidas, agora, usuarioId, atividadeId]
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


function lerLinhasRanking(linhas: unknown[]): LinhaRanking[] {
    return linhas.flatMap((linha) => {
        const resultado = linhaRankingSchema.safeParse(linha);
        if (!resultado.success) {
            console.warn('Linha de ranking inválida ignorada:', resultado.error.issues);
            return [];
        }
        return [resultado.data];
    });
}

/**
 * Classificação geral pelos pontos acumulados. Desempata pelo nome e depois
 * pelo id, para a ordem ser estável entre consultas. Também devolve a posição
 * do usuário informado, mesmo quando ele não está entre os `limite` primeiros.
 */
export async function buscarRanking(
    usuarioId: number | null,
    limite: number
): Promise<ResumoRanking> {

    const db = await abrirBancoDeDados();

    const lideres = lerLinhasRanking(
        await db.getAllAsync<unknown>(
            `SELECT id, nome, avatar, pontos
             FROM usuarios
             ORDER BY pontos DESC, nome COLLATE NOCASE ASC, id ASC
             LIMIT ?`,
            [limiteSeguro(limite)]
        )
    );

    const contagem = await db.getFirstAsync<{ total: number }>(
        'SELECT COUNT(*) AS total FROM usuarios'
    );

    const total = contagem?.total ?? 0;

    if (usuarioId === null) {
        return { lideres, total, usuario: null };
    }

    const [linha] = lerLinhasRanking(
        await db.getAllAsync<unknown>(
            `SELECT id, nome, avatar, pontos
             FROM usuarios
             WHERE id = ?`,
            [usuarioId]
        )
    );

    if (!linha) {
        return { lideres, total, usuario: null };
    }

    const acimaLinhas = await db.getAllAsync<unknown>(
        `SELECT id, nome, avatar, pontos
         FROM usuarios
         WHERE pontos > ?
         ORDER BY pontos ASC, nome COLLATE NOCASE DESC, id DESC
         LIMIT 1`,
        [linha.pontos]
    );

    const melhores = await db.getFirstAsync<{ quantidade: number }>(
        'SELECT COUNT(*) AS quantidade FROM usuarios WHERE pontos > ?',
        [linha.pontos]
    );

    return {
        lideres,
        total,
        usuario: {
            linha,
            posicao: (melhores?.quantidade ?? 0) + 1,
            acima: lerLinhasRanking(acimaLinhas)[0] ?? null,
        },
    };
}

export type DadosContaFirebase = {
    uid: string;
    nome: string;
    email: string;
};

export type OpcoesVinculo = {
    /**
     * Id de um perfil local já autenticado (senha local conferida) que deve ser
     * ligado a esta conta. Sem ele, um perfil local de mesmo e-mail nunca é
     * herdado: quem cria uma conta Firebase com o e-mail de outra pessoa não
     * leva o progresso salvo no aparelho.
     */
    perfilLocalVerificadoId?: number;
};

/** Perfil local de uma conta Firebase, ou `null` se ela ainda não entrou neste aparelho. */
export async function buscarUsuarioPorFirebaseUid(
    uid: string
): Promise<Usuario | null> {

    const db = await abrirBancoDeDados();

    const usuario = await db.getFirstAsync<Usuario>(
        `SELECT ${COLUNA_USUARIO}
         FROM usuarios
         WHERE firebase_uid = ?`,
        [uid]
    );

    return usuario ?? null;
}

/**
 * Garante um perfil local para a conta Firebase e devolve esse perfil.
 * O progresso continua no SQLite (funciona offline) e é sincronizado depois.
 *
 * 1. Se a conta já tem perfil, atualiza nome/e-mail e devolve.
 * 2. Se foi informado um perfil local verificado e ainda sem conta, liga os dois.
 * 3. Senão cria um perfil novo. Se o e-mail já pertence a um perfil local de
 *    outra pessoa, o novo perfil guarda um e-mail interno para não colidir.
 */
export async function vincularContaFirebase(
    conta: DadosContaFirebase,
    opcoes: OpcoesVinculo = {}
): Promise<Usuario> {

    const db = await abrirBancoDeDados();

    const uid = conta.uid.trim();
    const nome = conta.nome.trim() || 'Aluno';
    const email = normalizarEmail(conta.email);

    if (!uid) {
        throw new Error('Uid do Firebase vazio.');
    }

    let usuarioId: number | null = null;

    await db.withTransactionAsync(async () => {

        const existente = await db.getFirstAsync<{ id: number; email: string }>(
            'SELECT id, email FROM usuarios WHERE firebase_uid = ?',
            [uid]
        );

        if (existente) {
            usuarioId = existente.id;

            const emailLivre = await db.getFirstAsync<{ id: number }>(
                'SELECT id FROM usuarios WHERE email = ? AND id <> ?',
                [email, existente.id]
            );

            await db.runAsync(
                'UPDATE usuarios SET nome = ?, email = ? WHERE id = ?',
                [nome, emailLivre ? existente.email : email, existente.id]
            );
            return;
        }

        if (opcoes.perfilLocalVerificadoId !== undefined) {
            const resultado = await db.runAsync(
                `UPDATE usuarios
                 SET firebase_uid = ?, senha = ?
                 WHERE id = ? AND firebase_uid IS NULL`,
                [uid, SENHA_CONTA_FIREBASE, opcoes.perfilLocalVerificadoId]
            );

            if (resultado.changes === 1) {
                usuarioId = opcoes.perfilLocalVerificadoId;
                return;
            }
        }

        const emailEmUso = await db.getFirstAsync<{ id: number }>(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );

        const inserido = await db.runAsync(
            `INSERT INTO usuarios (nome, email, senha, tipo, firebase_uid)
             VALUES (?, ?, ?, 'aluno', ?)`,
            [nome, emailEmUso ? `${uid}@firebase.local` : email, SENHA_CONTA_FIREBASE, uid]
        );

        usuarioId = inserido.lastInsertRowId;
    });

    if (usuarioId === null) {
        throw new Error('Não foi possível vincular a conta.');
    }

    const usuario = await buscarUsuario(usuarioId);

    if (!usuario) {
        throw new Error('Perfil vinculado não encontrado.');
    }

    return usuario;
}

/** Linhas de progresso ainda não enviadas para a nuvem. */
export async function buscarProgressoPendente(
    usuarioId: number
): Promise<Progresso[]> {

    const progresso = await buscarProgresso(usuarioId);

    return progresso.filter((linha) => linha.sincronizado === 0);
}

/**
 * Marca uma linha como sincronizada, mas só se ela não mudou desde o envio
 * (mesmos pontos e estrelas). Uma conclusão feita durante o envio continua pendente.
 */
export async function marcarProgressoSincronizado(
    usuarioId: number,
    atividadeId: string,
    pontos: number,
    estrelas: number
): Promise<boolean> {

    const db = await abrirBancoDeDados();

    const resultado = await db.runAsync(
        `UPDATE progresso
         SET sincronizado = 1
         WHERE usuario_id = ? AND atividade_id = ? AND pontos = ? AND estrelas = ?`,
        [usuarioId, atividadeId, pontos, estrelas]
    );

    return resultado.changes === 1;
}

export type ProgressoRemoto = {
    atividadeId: string;
    pontos: number;
    estrelas: number;
    /** Moedas da lição, creditadas se ela ainda não existia neste aparelho. */
    moedas: number;
};

/**
 * Junta o progresso vindo da nuvem com o local, ficando sempre com o melhor de
 * cada lição. O total de pontos do usuário sobe só pela diferença, numa única
 * transação. Linhas em que o local já é igual ou pior que a nuvem ficam
 * sincronizadas; as em que o local é melhor continuam pendentes de envio.
 */
export async function mesclarProgressoRemoto(
    usuarioId: number,
    remotos: readonly ProgressoRemoto[]
): Promise<void> {

    if (remotos.length === 0) return;

    const db = await abrirBancoDeDados();

    await db.withTransactionAsync(async () => {

        const agora = new Date().toISOString();

        for (const remoto of remotos) {
            const pontos = Math.max(0, Math.floor(remoto.pontos));
            const estrelas = Math.min(3, Math.max(0, Math.round(remoto.estrelas)));

            const local = await db.getFirstAsync<{ pontos: number; estrelas: number }>(
                `SELECT pontos, estrelas
                 FROM progresso
                 WHERE usuario_id = ? AND atividade_id = ?`,
                [usuarioId, remoto.atividadeId]
            );

            if (!local) {
                await db.runAsync(
                    `INSERT INTO progresso (
                        usuario_id, atividade_id, pontos, tentativas,
                        concluida_em, sincronizado, estrelas
                    )
                    VALUES (?, ?, ?, 1, ?, 1, ?)`,
                    [usuarioId, remoto.atividadeId, pontos, agora, estrelas]
                );

                await db.runAsync(
                    `UPDATE usuarios
                     SET pontos = pontos + ?, moedas = moedas + ?
                     WHERE id = ?`,
                    [pontos, Math.max(0, Math.floor(remoto.moedas)), usuarioId]
                );
                continue;
            }

            const ganho = Math.max(0, pontos - local.pontos);
            const novosPontos = local.pontos + ganho;
            const novasEstrelas = Math.max(local.estrelas, estrelas);
            const localEhMelhor = local.pontos > pontos || local.estrelas > estrelas;

            await db.runAsync(
                `UPDATE progresso
                 SET pontos = ?, estrelas = ?, sincronizado = ?
                 WHERE usuario_id = ? AND atividade_id = ?`,
                [novosPontos, novasEstrelas, localEhMelhor ? 0 : 1, usuarioId, remoto.atividadeId]
            );

            if (ganho > 0) {
                await db.runAsync(
                    'UPDATE usuarios SET pontos = pontos + ? WHERE id = ?',
                    [ganho, usuarioId]
                );
            }
        }
    });
}
