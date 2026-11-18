import { Stack } from 'expo-router';
import React from 'react';

import { useConfiguracao } from '@/context/ConfiguracaoContext';

console.log('Stack =', typeof Stack, '| Stack.Screen =', typeof Stack.Screen);

export const unstable_settings = {
  // Garante o menu por baixo ao abrir uma atividade direto por deep link.
  anchor: '(drawer)',
};

/**
 * App autenticado: o Drawer com as telas principais fica na base da pilha e
 * telas de detalhe (ex.: atividades/[id]) são empilhadas por cima, com botão voltar.
 */
export default function AppLayout() {
  const { cores, fonte } = useConfiguracao();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: cores.superficie },
        headerTintColor: cores.primaria,
        headerTitleStyle: { color: cores.texto, fontSize: fonte(20), fontWeight: 'bold' },
        contentStyle: { backgroundColor: cores.fundo },
      }}
    >
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      <Stack.Screen name="atividades/[id]" options={{ title: 'Atividade' }} />
    </Stack>
  );
}
