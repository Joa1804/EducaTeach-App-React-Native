
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

import { useFonts } from 'expo-font';
import {
  Fredoka_500Medium,
  Fredoka_700Bold,
} from '@expo-google-fonts/fredoka';
import {
  Nunito_400Regular,
  Nunito_700Bold,
} from '@expo-google-fonts/nunito';
import { PixelifySans_700Bold } from '@expo-google-fonts/pixelify-sans';

import { ConfiguracaoProvider } from '@/context/ConfiguracaoContext';
import { UsuarioProvider, useUsuario } from '@/context/UsuarioContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
  anchor: '(app)',
};

export default function RootLayout() {
  const [fontesCarregadas, erroFontes] = useFonts({
    Fredoka_500Medium,
    Fredoka_700Bold,
    Nunito_400Regular,
    Nunito_700Bold,
    PixelifySans_700Bold,
  });

  if (!fontesCarregadas && !erroFontes) {
    return null;
  }

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

  const autenticado = status === 'autenticado';

  useEffect(() => {
    if (status !== 'carregando') {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [status]);

  
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={autenticado} redirectTo="/login" >
          <Stack.Screen name="(app)" />
          <Stack.Screen name="modal" options={{presentation: 'modal', title: 'Modal', headerShown: true,}}/>
        </Stack.Protected>

        <Stack.Protected guard={!autenticado} redirectTo="/">
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>

      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
