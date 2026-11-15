import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
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
  anchor: '(tabs)',
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

function RootNavigator() {
  const colorScheme = useColorScheme();
  const { status } = useUsuario();

  useEffect(() => {
    if (status !== 'carregando') {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [status]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Protected guard={status === 'autenticado'}>
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack.Protected>
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
