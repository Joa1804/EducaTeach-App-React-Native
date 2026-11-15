/// <reference types="node" />
import { createHash, randomBytes } from 'node:crypto';

/** Subconjunto da API do expo-crypto usado pelo app, implementado com node:crypto. */
export enum CryptoDigestAlgorithm {
  SHA256 = 'SHA-256',
}

export enum CryptoEncoding {
  HEX = 'hex',
  BASE64 = 'base64',
}

type DigestOptions = {
  encoding: CryptoEncoding;
};

function nomeNode(algoritmo: CryptoDigestAlgorithm): string {
  switch (algoritmo) {
    case CryptoDigestAlgorithm.SHA256:
      return 'sha256';
  }
}

export function getRandomBytes(tamanho: number): Uint8Array {
  return new Uint8Array(randomBytes(tamanho));
}

export async function digest(
  algoritmo: CryptoDigestAlgorithm,
  dados: BufferSource,
): Promise<ArrayBuffer> {
  const bytes =
    dados instanceof ArrayBuffer
      ? new Uint8Array(dados)
      : new Uint8Array(dados.buffer, dados.byteOffset, dados.byteLength);
  const resultado = createHash(nomeNode(algoritmo)).update(bytes).digest();

  return resultado.buffer.slice(
    resultado.byteOffset,
    resultado.byteOffset + resultado.byteLength,
  ) as ArrayBuffer;
}

export async function digestStringAsync(
  algoritmo: CryptoDigestAlgorithm,
  dados: string,
  opcoes: DigestOptions = { encoding: CryptoEncoding.HEX },
): Promise<string> {
  return createHash(nomeNode(algoritmo)).update(dados, 'utf8').digest(opcoes.encoding);
}
