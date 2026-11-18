import { Drawer } from 'expo-router/drawer';
import React, { useCallback } from 'react';
import { useWindowDimensions } from 'react-native';

import { AppDrawerContent } from '@/components/navigation/app-drawer-content';
import {
  DRAWER_SCREEN_TITLES,
  PERMANENT_DRAWER_MIN_WIDTH,
  type DrawerRouteName,
} from '@/constants/navigation';
import { useConfiguracao } from '@/context/ConfiguracaoContext';
import type { DrawerContentComponentProps } from 'expo-router/drawer';

import * as RouterDrawer from 'expo-router/drawer';
console.log(
  'Drawer =', typeof RouterDrawer.Drawer,
  '| DrawerContentScrollView =', typeof (RouterDrawer as any).DrawerContentScrollView
);

const SCREEN_NAMES = Object.keys(DRAWER_SCREEN_TITLES) as DrawerRouteName[];

/** Menu lateral do app autenticado. Substitui o antigo AppShell repetido em cada tela. */
export default function DrawerLayout() {
  const { cores, fonte } = useConfiguracao();
  const { width } = useWindowDimensions();
  const permanente = width >= PERMANENT_DRAWER_MIN_WIDTH;

  const renderContent = useCallback(
    (props: DrawerContentComponentProps) => <AppDrawerContent {...props} />,
    []
  );

  return (
    <Drawer
      drawerContent={renderContent}
      screenOptions={{
        drawerType: permanente ? 'permanent' : 'front',
        // Com o menu fixo na lateral o botão de abrir/fechar não tem função.
        headerLeft: permanente ? () => null : undefined,
        drawerStyle: {
          width: 240,
          backgroundColor: cores.superficie,
          borderRightColor: cores.borda,
        },
        headerStyle: { backgroundColor: cores.superficie, borderBottomColor: cores.borda },
        headerTintColor: cores.primaria,
        headerTitleStyle: { color: cores.texto, fontSize: fonte(22), fontWeight: 'bold' },
        sceneStyle: { backgroundColor: cores.fundo },
      }}
    >
      {SCREEN_NAMES.map((name) => (
        <Drawer.Screen key={name} name={name} options={{ title: DRAWER_SCREEN_TITLES[name] }} />
      ))}
    </Drawer>
  );
}
