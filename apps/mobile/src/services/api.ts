import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import {
  User,
  Transaction,
  Category,
  Account,
  Budget,
  SavingsGoal,
  LoginCredentials,
  RegisterCredentials,
  DashboardSummary,
} from '../types';
import { API_URL } from '../constants';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('auth-storage');
    if (token) {
      try {
        const parsed = JSON.parse(token);
        if (parsed.state?.token) {
          config.headers.Authorization = `Bearer ${parsed.state.token}`;
        }
      } catch (e) {
        // Token parsing failed
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear token and redirect to login
      SecureStore.deleteItemAsync('auth-storage');
    }
    return Promise.reject(error.response?.data || error);
  }
);

// Auth Service
export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async register(credentials: RegisterCredentials): Promise<{ user: User; token: string }> {
    const response = await api.post('/auth/register', credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getProfile(): Promise<User> {
    const response = await api.get('/users/me');
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put('/users/me', data);
    return response.data;
  },
};

// Transaction Service
export const transactionService = {
  async getAll(params?: { startDate?: string; endDate?: string; categoryId?: string }): Promise<Transaction[]> {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  async getById(id: string): Promise<Transaction> {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  async create(transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const response = await api.post('/transactions', transaction);
    return response.data;
  },

  async update(id: string, transaction: Partial<Transaction>): Promise<Transaction> {
    const response = await api.put(`/transactions/${id}`, transaction);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`);
  },
};

// Category Service
export const categoryService = {
  async getAll(): Promise<Category[]> {
    const response = await api.get('/categories');
    return response.data;
  },

  async create(category: Omit<Category, 'id'>): Promise<Category> {
    const response = await api.post('/categories', category);
    return response.data;
  },

  async update(id: string, category: Partial<Category>): Promise<Category> {
    const response = await api.put(`/categories/${id}`, category);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};

// Account Service
export const accountService = {
  async getAll(): Promise<Account[]> {
    const response = await api.get('/accounts');
    return response.data;
  },

  async getById(id: string): Promise<Account> {
    const response = await api.get(`/accounts/${id}`);
    return response.data;
  },

  async create(account: Omit<Account, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    const response = await api.post('/accounts', account);
    return response.data;
  },

  async update(id: string, account: Partial<Account>): Promise<Account> {
    const response = await api.put(`/accounts/${id}`, account);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/accounts/${id}`);
  },

  async transfer(fromAccountId: string, toAccountId: string, amount: number): Promise<void> {
    await api.post('/accounts/transfer', { fromAccountId, toAccountId, amount });
  },
};

// Budget Service
export const budgetService = {
  async getAll(): Promise<Budget[]> {
    const response = await api.get('/budgets');
    return response.data;
  },

  async getCurrent(): Promise<Budget[]> {
    const response = await api.get('/budgets/current');
    return response.data;
  },

  async create(budget: Omit<Budget, 'id' | 'userId' | 'spent'>): Promise<Budget> {
    const response = await api.post('/budgets', budget);
    return response.data;
  },

  async update(id: string, budget: Partial<Budget>): Promise<Budget> {
    const response = await api.put(`/budgets/${id}`, budget);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/budgets/${id}`);
  },
};

// Goal Service
export const goalService = {
  async getAll(): Promise<SavingsGoal[]> {
    const response = await api.get('/goals');
    return response.data;
  },

  async getById(id: string): Promise<SavingsGoal> {
    const response = await api.get(`/goals/${id}`);
    return response.data;
  },

  async create(goal: Omit<SavingsGoal, 'id' | 'userId' | 'currentAmount' | 'isCompleted' | 'completedAt' | 'createdAt' | 'updatedAt'>): Promise<SavingsGoal> {
    const response = await api.post('/goals', goal);
    return response.data;
  },

  async update(id: string, goal: Partial<SavingsGoal>): Promise<SavingsGoal> {
    const response = await api.put(`/goals/${id}`, goal);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/goals/${id}`);
  },

  async contribute(goalId: string, amount: number, notes?: string): Promise<SavingsGoal> {
    const response = await api.post(`/goals/${goalId}/contribute`, { amount, notes });
    return response.data;
  },

  async getContributions(goalId: string): Promise<any[]> {
    const response = await api.get(`/goals/${goalId}/contributions`);
    return response.data;
  },
};

// Dashboard Service
export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const response = await api.get('/reports/summary');
    return response.data;
  },

  async getExpensesByCategory(startDate: string, endDate: string): Promise<any> {
    const response = await api.get('/reports/expenses', { params: { startDate, endDate } });
    return response.data;
  },

  async getMonthlyTrend(months: number = 6): Promise<any> {
    const response = await api.get('/reports/trend', { params: { months } });
    return response.data;
  },
};

export default api;
