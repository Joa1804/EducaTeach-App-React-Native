import type { FirebaseOptions } from 'firebase/app';
import { z } from 'zod';

/**
 * Configuração do Firebase lida de variáveis EXPO_PUBLIC_*.
 *
 * Importante: variáveis EXPO_PUBLIC_* são embutidas no bundle do app em tempo de build,
 * então NÃO são segredos. A config web do Firebase é pública por natureza; a proteção real
 * vem das Security Rules, do App Check e das restrições da API key no Google Cloud.
 * Nunca coloque aqui chaves de serviço (service account) ou segredos de backend.
 */
const obrigatoria = (nome: string) =>
  z
    .string({ error: `${nome} não definida.` })
    .trim()
    .min(1, `${nome} não definida.`);

const firebaseEnvSchema = z.object({
  EXPO_PUBLIC_FIREBASE_API_KEY: obrigatoria('EXPO_PUBLIC_FIREBASE_API_KEY'),
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: obrigatoria('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: obrigatoria('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: obrigatoria('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: obrigatoria('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  EXPO_PUBLIC_FIREBASE_APP_ID: obrigatoria('EXPO_PUBLIC_FIREBASE_APP_ID'),
  EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID: z
    .string()
    .trim()
    .transform((valor) => (valor === '' ? undefined : valor))
    .optional(),
});

/** Valores crus do ambiente: qualquer variável pode estar ausente. */
export type FirebaseEnv = { [Chave in keyof z.input<typeof firebaseEnvSchema>]?: string };

export class FirebaseConfigError extends Error {
  constructor(problemas: string[]) {
    super(
      `Configuração do Firebase inválida: ${problemas.join(' ')} ` +
        'Copie .env.example para .env e preencha os valores.',
    );
    this.name = 'FirebaseConfigError';
  }
}

/** Valida as variáveis e monta o objeto aceito por `initializeApp`. */
export function criarFirebaseConfig(env: FirebaseEnv): FirebaseOptions {
  const resultado = firebaseEnvSchema.safeParse(env);

  if (!resultado.success) {
    throw new FirebaseConfigError(resultado.error.issues.map((issue) => issue.message));
  }

  const dados = resultado.data;

  return {
    apiKey: dados.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: dados.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: dados.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: dados.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: dados.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: dados.EXPO_PUBLIC_FIREBASE_APP_ID,
    ...(dados.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
      ? { measurementId: dados.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID }
      : {}),
  };
}

/**
 * Lê as variáveis do ambiente. O Expo só substitui `process.env.EXPO_PUBLIC_*` acessado
 * com notação de ponto literal, por isso cada variável é lida explicitamente.
 */
export function lerFirebaseEnv(): FirebaseEnv {
  return {
    EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
}
