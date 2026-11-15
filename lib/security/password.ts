import * as Crypto from 'expo-crypto';

/**
 * Hash de senha com salt aleatório e key stretching sobre SHA-256 (expo-crypto).
 *
 * Formato armazenado: `sha256i$<iteracoes>$<saltHex>$<hashHex>`.
 * O número de iterações fica salvo junto do hash, então é possível aumentar
 * o custo no futuro sem invalidar as senhas já cadastradas.
 */
const PREFIXO = 'sha256i';
const SEPARADOR = '$';
const ITERACOES_PADRAO = 4096;
const TAMANHO_SALT_BYTES = 16;

const encoder = new TextEncoder();

export type ResultadoVerificacao = {
    valida: boolean;
    /** true quando a senha confere mas o hash deve ser regravado (legado ou custo antigo). */
    precisaAtualizar: boolean;
};

function paraHex(bytes: Uint8Array): string {
    let hex = '';
    for (const byte of bytes) {
        hex += byte.toString(16).padStart(2, '0');
    }
    return hex;
}

function deHex(hex: string): Uint8Array | null {
    if (hex.length % 2 !== 0 || !/^[0-9a-f]*$/i.test(hex)) return null;

    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return bytes;
}

function concatenar(a: Uint8Array, b: Uint8Array): Uint8Array<ArrayBuffer> {
    const resultado = new Uint8Array(a.length + b.length);
    resultado.set(a, 0);
    resultado.set(b, a.length);
    return resultado;
}

/** Comparação em tempo constante para não vazar, pelo tempo de resposta, quantos caracteres conferem. */
export function compararSeguro(a: string, b: string): boolean {
    const bytesA = encoder.encode(a);
    const bytesB = encoder.encode(b);
    const tamanho = Math.max(bytesA.length, bytesB.length);

    let diferenca = bytesA.length ^ bytesB.length;
    for (let i = 0; i < tamanho; i++) {
        diferenca |= (bytesA[i] ?? 0) ^ (bytesB[i] ?? 0);
    }
    return diferenca === 0;
}

async function derivar(senha: string, salt: Uint8Array, iteracoes: number): Promise<string> {
    const senhaBytes = encoder.encode(senha);
    let bloco = new Uint8Array(
        await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, concatenar(salt, senhaBytes))
    );

    for (let i = 1; i < iteracoes; i++) {
        bloco = new Uint8Array(
            await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, concatenar(bloco, salt))
        );
    }

    return paraHex(bloco);
}

export function ehHashSuportado(valor: string): boolean {
    return valor.startsWith(`${PREFIXO}${SEPARADOR}`);
}

export async function gerarHashSenha(senha: string): Promise<string> {
    const salt = Crypto.getRandomBytes(TAMANHO_SALT_BYTES);
    const hash = await derivar(senha, salt, ITERACOES_PADRAO);

    return [PREFIXO, String(ITERACOES_PADRAO), paraHex(salt), hash].join(SEPARADOR);
}

export async function verificarSenha(senha: string, armazenado: string): Promise<ResultadoVerificacao> {
    // Registros antigos (antes desta migração) guardavam a senha em texto puro.
    if (!ehHashSuportado(armazenado)) {
        const valida = compararSeguro(senha, armazenado);
        return { valida, precisaAtualizar: valida };
    }

    const partes = armazenado.split(SEPARADOR);
    if (partes.length !== 4) return { valida: false, precisaAtualizar: false };

    const [, iteracoesTexto, saltHex, hashEsperado] = partes;
    const iteracoes = Number(iteracoesTexto);
    const salt = deHex(saltHex);

    if (!Number.isInteger(iteracoes) || iteracoes < 1 || !salt) {
        return { valida: false, precisaAtualizar: false };
    }

    const hashCalculado = await derivar(senha, salt, iteracoes);
    const valida = compararSeguro(hashCalculado, hashEsperado);

    return { valida, precisaAtualizar: valida && iteracoes < ITERACOES_PADRAO };
}

/**
 * Executa uma derivação descartável. Usado quando o e-mail não existe,
 * para que o tempo de resposta não revele quais contas estão cadastradas.
 */
export async function simularVerificacao(senha: string): Promise<void> {
    await derivar(senha, Crypto.getRandomBytes(TAMANHO_SALT_BYTES), ITERACOES_PADRAO);
}

/** Token opaco de sessão (256 bits). */
export function gerarTokenSessao(): string {
    return paraHex(Crypto.getRandomBytes(32));
}

/** O banco guarda só o SHA-256 do token: quem ler o SQLite não consegue reaproveitar sessões. */
export function hashToken(token: string): Promise<string> {
    return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, token, {
        encoding: Crypto.CryptoEncoding.HEX,
    });
}
