import type { ImageSourcePropType } from 'react-native';
import type { Href } from 'expo-router';

/**
 * Fonte única dos itens do menu lateral.
 * O nome precisa corresponder ao Drawer.Screen.
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

/**
 * Tipo dos itens do menu.
 * Os ícones agora são imagens PNG.
 */
export type DrawerMenuItem = {
  name: DrawerRouteName;
  href: Href;
  title: string;
  icon: ImageSourcePropType;
};

/** Itens exibidos na lista principal do menu lateral. */
export const DRAWER_MENU_ITEMS: readonly DrawerMenuItem[] = [
  { name: 'index', href: '/', title: 'Início', icon: require('../assets/images/Icon-House.png'),},
  {name: 'aprender', href: '/aprender', title: 'Aprender', icon: require('../assets/images/icone-livror.png'),},
  { name: 'forum', href: '/forum', title: 'Fórum', icon: require('../assets/images/icone-forum.png'),},
  {name: 'projetos', href: '/projetos', title: 'Meus Projetos', icon: require('../assets/images/icone-pastar.png'),},
  { name: 'ranking', href: '/ranking', title: 'Ranking', icon: require('../assets/images/icone-rank.png'),},
  { name: 'ajudar', href: '/ajudar', title: 'Ajuda', icon: require('../assets/images/icone-pergutar.png'),},
];

/** Item fixo no rodapé do menu. */
export const DRAWER_SETTINGS_ITEM: DrawerMenuItem = {
  name: 'configuracao',
  href: '/configuracao',
  title: 'Configuração',
  icon: require('../assets/images/icone-configuracao.png'),
};

/** Títulos de cabeçalho de todas as telas do Drawer. */
export const DRAWER_SCREEN_TITLES: Readonly<
  Record<DrawerRouteName, string>
> = {
  index: 'Início',
  aprender: 'Aprender',
  forum: 'Fórum',
  projetos: 'Meus Projetos',
  ranking: 'Ranking',
  ajudar: 'Ajuda',
  desafios: 'Desafios',
  configuracao: 'Configuração',
};

/** Largura mínima para o menu ficar fixo na lateral. */
export const PERMANENT_DRAWER_MIN_WIDTH = 768;
