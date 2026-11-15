import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

import { ConfiguracaoProvider } from '@/context/ConfiguracaoContext';
import { UsuarioProvider, useUsuario } from '@/context/UsuarioContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Mantém a splash até sabermos se há sessão salva, evitando "piscar" a tela de login.
SplashScreen.preventAutoHideAsync().catch(() => {
  // Em alguns ambientes (ex.: web) não há splash nativa; pode ignorar.
});

export const unstable_settings = {
  anchor: '(app)',
};

export default function RootLayout() {
  return (
    <ConfiguracaoProvider>
      <UsuarioProvider>
        <RootNavigator />
      </UsuarioProvider>
    </ConfiguracaoProvider>
  );
}

/**
 * Proteção de rotas pela sessão, feita por grupo:
 * - (auth): login e cadastro, só existem sem sessão;
 * - (app): todo o app autenticado (menu lateral + telas empilhadas);
 * - modal: só com sessão.
 *
 * Quando o guard muda, o Expo Router redireciona sozinho para o `redirectTo`
 * do bloco (sem sessão → /login; com sessão → /). Toda tela nova deve ficar
 * dentro de um desses grupos.
 */
function RootNavigator() {
  const colorScheme = useColorScheme();
  const { status } = useUsuario();
  const autenticado = status === 'autenticado';

  useEffect(() => {
    if (status !== 'carregando') {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [status]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={autenticado} redirectTo="/login">
          <Stack.Screen name="(app)" />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
        </Stack.Protected>

        <Stack.Protected guard={!autenticado} redirectTo="/">
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
