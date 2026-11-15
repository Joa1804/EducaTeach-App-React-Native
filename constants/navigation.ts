import type { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';

/**
 * Fonte única dos itens do menu lateral.
 * `name` é o nome do arquivo da rota dentro de app/(app)/(drawer) e precisa
 * bater com o `Drawer.Screen` correspondente.
 */
export type DrawerRouteName =
  | 'index'
  | 'aprender'
  | 'forum'
  | 'projetos'
  | 'ranking'
  | 'ajudar'
  | 'desafios'
  | 'configuracao';

export type DrawerMenuItem = {
  name: DrawerRouteName;
  href: Href;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
};

/** Itens exibidos na lista principal do menu, na ordem em que aparecem. */
export const DRAWER_MENU_ITEMS: readonly DrawerMenuItem[] = [
  { name: 'index', href: '/', title: 'Início', icon: 'home' },
  { name: 'aprender', href: '/aprender', title: 'Aprender', icon: 'book' },
  { name: 'forum', href: '/forum', title: 'Fórum', icon: 'chatbubbles' },
  { name: 'projetos', href: '/projetos', title: 'Meus Projetos', icon: 'folder-open' },
  { name: 'ranking', href: '/ranking', title: 'Ranking', icon: 'podium' },
  { name: 'ajudar', href: '/ajudar', title: 'Ajuda', icon: 'help-circle' },
];

/** Item fixo no rodapé do menu. */
export const DRAWER_SETTINGS_ITEM: DrawerMenuItem = {
  name: 'configuracao',
  href: '/configuracao',
  title: 'Configuração',
  icon: 'settings-outline',
};

/** Títulos de cabeçalho de todas as telas do Drawer, inclusive as que não aparecem no menu. */
export const DRAWER_SCREEN_TITLES: Readonly<Record<DrawerRouteName, string>> = {
  index: 'Início',
  aprender: 'Aprender',
  forum: 'Fórum',
  projetos: 'Meus Projetos',
  ranking: 'Ranking',
  ajudar: 'Ajuda',
  desafios: 'Desafios',
  configuracao: 'Configuração',
};

/** Largura a partir da qual o menu fica fixo na lateral (tablet/web). */
export const PERMANENT_DRAWER_MIN_WIDTH = 768;
