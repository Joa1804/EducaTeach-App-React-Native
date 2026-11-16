import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { connectAuthEmulator, type Auth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore';

import {
  criarFirebaseConfig,
  lerFirebaseEnv,
  obterFirebaseOptions,
} from '../lib/config/firebase-config';
import { criarAuth } from './firebase-auth';

/**
 * Indica se as variáveis EXPO_PUBLIC_FIREBASE_* foram preenchidas. Sem elas o
 * app continua funcionando só com contas e ranking locais (modo offline).
 */
export function firebaseHabilitado(): boolean {
  return obterFirebaseOptions() !== null;
}

/**
 * Instância única do Firebase, criada sob demanda (nada é inicializado só por importar
 * este módulo). As credenciais vêm de variáveis EXPO_PUBLIC_*; veja .env.example.
 */
export function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp(criarFirebaseConfig(lerFirebaseEnv()));
}

/**
 * Host dos emuladores locais (ex.: 127.0.0.1), só em desenvolvimento. Permite
 * testar login e ranking sem tocar no projeto real: `npm run emuladores`.
 */
function hostDoEmulador(): string | null {
  const host = process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST?.trim();
  return __DEV__ && host ? host : null;
}

let auth: Auth | null = null;

/** Auth com a sessão persistida no aparelho (AsyncStorage no celular, IndexedDB na web). */
export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = criarAuth(getFirebaseApp());
    const host = hostDoEmulador();
    if (host) {
      connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
    }
  }

  return auth;
}

let firestore: Firestore | null = null;

export function getFirestoreDb(): Firestore {
  if (!firestore) {
    firestore = getFirestore(getFirebaseApp());
    const host = hostDoEmulador();
    if (host) {
      connectFirestoreEmulator(firestore, host, 8080);
    }
  }

  return firestore;
}

let analyticsPromise: Promise<Analytics | null> | null = null;

/**
 * O Analytics do SDK web só funciona no navegador (precisa de cookies/IndexedDB).
 * No Android/iOS `isSupported()` retorna false e esta função resolve `null`,
 * em vez de quebrar o app como a chamada direta a `getAnalytics` fazia.
 */
export function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (!analyticsPromise) {
    analyticsPromise = isSupported()
      .then((suportado) => (suportado ? getAnalytics(getFirebaseApp()) : null))
      .catch((error: unknown) => {
        analyticsPromise = null;
        throw error;
      });
  }

  return analyticsPromise;
}
