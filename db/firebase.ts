import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

import { criarFirebaseConfig, lerFirebaseEnv } from '../lib/config/firebase-config';

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
