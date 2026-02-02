export const colors = {
  // Primary colors
  primary: '#4CAF50',
  primaryDark: '#388E3C',
  primaryLight: '#C8E6C9',

  // Secondary colors
  secondary: '#2196F3',
  secondaryDark: '#1976D2',
  secondaryLight: '#BBDEFB',

  // Accent colors
  accent: '#FF9800',
  accentDark: '#F57C00',
  accentLight: '#FFE0B2',

  // Semantic colors
  success: '#8BC34A',
  warning: '#FFC107',
  error: '#F44336',
  info: '#03A9F4',

  // Income/Expense colors
  income: '#4CAF50',
  expense: '#F44336',
  transfer: '#2196F3',

  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',

  // Gray scale
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',

  // Transparent
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const lightTheme = {
  ...colors,
  background: '#FAFAFA',
  surface: '#FFFFFF',
  text: '#212121',
  textSecondary: '#757575',
  border: '#E0E0E0',
  card: '#FFFFFF',
  statusBar: 'dark' as const,
};

export const darkTheme = {
  ...colors,
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  border: '#333333',
  card: '#1E1E1E',
  statusBar: 'light' as const,
};

export type Theme = typeof lightTheme;
