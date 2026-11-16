import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence } from '@firebase/auth';
import type { FirebaseApp } from 'firebase/app';
import { getAuth, initializeAuth, type Auth } from 'firebase/auth';

/**
 * Android/iOS: sem a persistência do AsyncStorage o login se perderia a cada
 * abertura do app. `initializeAuth` só pode rodar uma vez por app; num reload
 * (Fast Refresh) a instância já existe e é reaproveitada.
 */
export function criarAuth(app: FirebaseApp): Auth {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error: unknown) {
    const codigo = (error as { code?: unknown } | null)?.code;
    if (codigo === 'auth/already-initialized') {
      return getAuth(app);
    }
    throw error;
  }
}
