import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Persistência do token de sessão.
 * - iOS/Android: SecureStore (Keychain / Keystore), acessível só com o aparelho desbloqueado
 *   e sem ir para backups de outros aparelhos.
 * - Web: SecureStore não existe, então cai no AsyncStorage (localStorage).
 */
const CHAVE_TOKEN = 'educateach.sessao.token';

const OPCOES_SECURE_STORE: SecureStore.SecureStoreOptions = {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

const usaSecureStore = Platform.OS !== 'web';

export async function salvarToken(token: string): Promise<void> {
    if (usaSecureStore) {
        await SecureStore.setItemAsync(CHAVE_TOKEN, token, OPCOES_SECURE_STORE);
        return;
    }
    await AsyncStorage.setItem(CHAVE_TOKEN, token);
}

export async function lerToken(): Promise<string | null> {
    if (usaSecureStore) {
        return SecureStore.getItemAsync(CHAVE_TOKEN, OPCOES_SECURE_STORE);
    }
    return AsyncStorage.getItem(CHAVE_TOKEN);
}

export async function apagarToken(): Promise<void> {
    if (usaSecureStore) {
        await SecureStore.deleteItemAsync(CHAVE_TOKEN, OPCOES_SECURE_STORE);
        return;
    }
    await AsyncStorage.removeItem(CHAVE_TOKEN);
}
