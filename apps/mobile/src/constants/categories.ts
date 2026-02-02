import { Category } from '../types';

export const DEFAULT_EXPENSE_CATEGORIES: Omit<Category, 'id' | 'userId' | 'createdAt'>[] = [
  { name: 'Cibo & Ristoranti', type: 'expense', icon: 'restaurant', color: '#FF5722', isDefault: true },
  { name: 'Trasporti', type: 'expense', icon: 'car', color: '#2196F3', isDefault: true },
  { name: 'Casa & Bollette', type: 'expense', icon: 'home', color: '#4CAF50', isDefault: true },
  { name: 'Shopping', type: 'expense', icon: 'shopping-bag', color: '#E91E63', isDefault: true },
  { name: 'Intrattenimento', type: 'expense', icon: 'film', color: '#9C27B0', isDefault: true },
  { name: 'Salute', type: 'expense', icon: 'heart', color: '#F44336', isDefault: true },
  { name: 'Sport & Fitness', type: 'expense', icon: 'dumbbell', color: '#00BCD4', isDefault: true },
  { name: 'Viaggi', type: 'expense', icon: 'plane', color: '#FF9800', isDefault: true },
  { name: 'Istruzione', type: 'expense', icon: 'book', color: '#3F51B5', isDefault: true },
  { name: 'Abbonamenti', type: 'expense', icon: 'credit-card', color: '#607D8B', isDefault: true },
  { name: 'Regali', type: 'expense', icon: 'gift', color: '#E91E63', isDefault: true },
  { name: 'Altro', type: 'expense', icon: 'more-horizontal', color: '#9E9E9E', isDefault: true },
];

export const DEFAULT_INCOME_CATEGORIES: Omit<Category, 'id' | 'userId' | 'createdAt'>[] = [
  { name: 'Stipendio', type: 'income', icon: 'briefcase', color: '#4CAF50', isDefault: true },
  { name: 'Freelance', type: 'income', icon: 'laptop', color: '#2196F3', isDefault: true },
  { name: 'Investimenti', type: 'income', icon: 'trending-up', color: '#FF9800', isDefault: true },
  { name: 'Affitto', type: 'income', icon: 'home', color: '#9C27B0', isDefault: true },
  { name: 'Regalo', type: 'income', icon: 'gift', color: '#E91E63', isDefault: true },
  { name: 'Rimborso', type: 'income', icon: 'refresh-cw', color: '#00BCD4', isDefault: true },
  { name: 'Altro', type: 'income', icon: 'more-horizontal', color: '#9E9E9E', isDefault: true },
];

export const ALL_DEFAULT_CATEGORIES = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES,
];
