// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  currency: string;
  language: string;
  theme: 'light' | 'dark' | 'system';
  createdAt: string;
}

// Account types
export interface Account {
  id: string;
  userId: string;
  name: string;
  type: 'bank' | 'cash' | 'card' | 'investment';
  balance: number;
  currency: string;
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Category types
export interface Category {
  id: string;
  userId?: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  parentId?: string;
  isDefault: boolean;
}

// Transaction types
export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  currency: string;
  description: string;
  notes?: string;
  date: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  attachments?: string[];
  tags?: string[];
  isRecurring: boolean;
  recurringId?: string;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  category?: Category;
  account?: Account;
}

// Recurring Transaction types
export interface RecurringTransaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  frequencyValue: number;
  startDate: string;
  endDate?: string;
  nextOccurrence: string;
  isActive: boolean;
}

// Budget types
export interface Budget {
  id: string;
  userId: string;
  categoryId?: string;
  amount: number;
  spent: number;
  period: 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  category?: Category;
}

// Savings Goal types
export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  imageUrl?: string;
  color: string;
  priority: number;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: number;
  date: string;
  notes?: string;
  createdAt: string;
}

// Dashboard Summary
export interface DashboardSummary {
  totalBalance: number;
  totalSavings: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  incomeChange: number;
  expenseChange: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}
