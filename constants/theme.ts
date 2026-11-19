/**
 * Below are the colors that are used in the app.
 * The colors are defined in the light and dark mode.
 */

import { Platform } from 'react-native';

const tintColorLight = '#673AB7';
const tintColorDark = '#D1C4E9';

export const Colors = {
  light: {
    text: '#212121',
    background: '#F5F5F7',
    tint: tintColorLight,
    icon: '#757575',
    tabIconDefault: '#757575',
    tabIconSelected: tintColorLight,

    primary: '#673AB7',
    primaryLight: '#D1C4E9',
    surface: '#FFFFFF',
    border: '#E5E5E5',
    danger: '#E53935',
  },

  dark: {
    text: '#ECEDEE',
    background: '#15121C',
    tint: tintColorDark,
    icon: '#BDBDBD',
    tabIconDefault: '#BDBDBD',
    tabIconSelected: tintColorDark,

    primary: '#B39DDB',
    primaryLight: '#673AB7',
    surface: '#211C2B',
    border: '#494252',
    danger: '#FF8A80',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },

  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },

  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
