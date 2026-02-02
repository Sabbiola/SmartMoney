export * from './categories';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '\u20AC',
  USD: '$',
  GBP: '\u00A3',
  CHF: 'CHF',
  JPY: '\u00A5',
};

export const DEFAULT_CURRENCY = 'EUR';

export const DATE_FORMATS = {
  short: 'DD/MM/YYYY',
  long: 'DD MMMM YYYY',
  time: 'HH:mm',
  full: 'DD/MM/YYYY HH:mm',
};

export const ACCOUNT_TYPES = [
  { value: 'bank', label: 'Conto Bancario', icon: 'building' },
  { value: 'cash', label: 'Contanti', icon: 'wallet' },
  { value: 'card', label: 'Carta', icon: 'credit-card' },
  { value: 'investment', label: 'Investimenti', icon: 'trending-up' },
] as const;

export const FREQUENCIES = [
  { value: 'daily', label: 'Giornaliera' },
  { value: 'weekly', label: 'Settimanale' },
  { value: 'monthly', label: 'Mensile' },
  { value: 'yearly', label: 'Annuale' },
] as const;
