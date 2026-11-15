import { Stack } from 'expo-router';
import React from 'react';

import { useUsuario } from '@/context/UsuarioContext';

/**
 * Proteção de rotas pela sessão.
 * Quando o guard muda, o Expo Router redireciona sozinho:
 * - sem sessão: qualquer tela protegida vai para a primeira tela pública (login);
 * - com sessão: login/cadastro deixam de existir e o app abre no início.
 *
 * Toda tela nova deste grupo precisa ser declarada aqui; telas não declaradas
 * ficam acessíveis sem login.
 */
export default function TabLayout() {
  const { status } = useUsuario();
  const autenticado = status === 'autenticado';

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={autenticado}>
        <Stack.Screen name="index" />
        <Stack.Screen name="aprede" />
        <Stack.Screen name="atividades/id" />
        <Stack.Screen name="desafios" />
        <Stack.Screen name="projetos" />
        <Stack.Screen name="ranking" />
        <Stack.Screen name="Forum" />
        <Stack.Screen name="ajudar" />
        <Stack.Screen name="configuracao" />
      </Stack.Protected>

      <Stack.Protected guard={!autenticado}>
        <Stack.Screen name="login" />
        <Stack.Screen name="Cadastro" />
      </Stack.Protected>
    </Stack>
  );
}
