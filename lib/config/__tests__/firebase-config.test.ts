import { criarFirebaseConfig, FirebaseConfigError, type FirebaseEnv } from '../firebase-config';

const ENV_VALIDO: FirebaseEnv = {
  EXPO_PUBLIC_FIREBASE_API_KEY: 'api-key',
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: 'demo.firebaseapp.com',
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: 'demo',
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: 'demo.firebasestorage.app',
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '123',
  EXPO_PUBLIC_FIREBASE_APP_ID: '1:123:web:abc',
  EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID: 'G-XYZ',
};

describe('criarFirebaseConfig', () => {
  it('monta a config do Firebase a partir das variáveis', () => {
    expect(criarFirebaseConfig(ENV_VALIDO)).toEqual({
      apiKey: 'api-key',
      authDomain: 'demo.firebaseapp.com',
      projectId: 'demo',
      storageBucket: 'demo.firebasestorage.app',
      messagingSenderId: '123',
      appId: '1:123:web:abc',
      measurementId: 'G-XYZ',
    });
  });

  it('omite measurementId quando vazio', () => {
    const config = criarFirebaseConfig({ ...ENV_VALIDO, EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID: '' });

    expect(config).not.toHaveProperty('measurementId');
  });

  it('lança FirebaseConfigError citando as variáveis ausentes', () => {
    const env: FirebaseEnv = {
      ...ENV_VALIDO,
      EXPO_PUBLIC_FIREBASE_API_KEY: undefined,
      EXPO_PUBLIC_FIREBASE_APP_ID: '   ',
    };

    expect(() => criarFirebaseConfig(env)).toThrow(FirebaseConfigError);
    expect(() => criarFirebaseConfig(env)).toThrow(
      /EXPO_PUBLIC_FIREBASE_API_KEY.*EXPO_PUBLIC_FIREBASE_APP_ID/,
    );
  });
});
