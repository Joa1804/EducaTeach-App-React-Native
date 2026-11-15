import { Stack } from 'expo-router';
import React from 'react';

/** Fluxo público (sem sessão). A proteção fica no layout raiz. */
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="cadastro" />
    </Stack>
  );
}
