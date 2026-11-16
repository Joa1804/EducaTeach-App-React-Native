import type { Persistence, ReactNativeAsyncStorage } from 'firebase/auth';

/**
 * O pacote @firebase/auth publica `getReactNativePersistence` só no build
 * react-native, mas o TypeScript lê os tipos do build web (condição "types"
 * vem antes de "react-native" no package.json). Esta declaração expõe a função
 * com a assinatura do build react-native (dist/rn/index.rn.d.ts).
 */
declare module '@firebase/auth' {
  export function getReactNativePersistence(storage: ReactNativeAsyncStorage): Persistence;
}
