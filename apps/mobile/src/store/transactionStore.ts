import { create } from 'zustand';
import { Transaction, Category, Account } from '../types';
import { transactionService, categoryService, accountService } from '../services/api';

interface TransactionState {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  isLoading: boolean;
  error: string | null;

  // Computed values
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;

  // Actions
  fetchTransactions: (params?: { startDate?: string; endDate?: string }) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  fetchCategories: () => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;

  fetchAccounts: () => Promise<void>;
  addAccount: (account: Omit<Account, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAccount: (id: string, account: Partial<Account>) => Promise<void>;

  clearError: () => void;
}

const getCurrentMonthRange = () => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
  return { startDate, endDate };
};

const calculateTotals = (transactions: Transaction[], accounts: Account[]) => {
  const { startDate, endDate } = getCurrentMonthRange();

  const monthlyTransactions = transactions.filter(
    (t) => t.date >= startDate && t.date <= endDate
  );

  const monthlyIncome = monthlyTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = monthlyTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = accounts
    .filter((a) => a.isActive)
    .reduce((sum, a) => sum + a.balance, 0);

  return { totalBalance, monthlyIncome, monthlyExpenses };
};

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  categories: [],
  accounts: [],
  isLoading: false,
  error: null,
  totalBalance: 0,
  monthlyIncome: 0,
  monthlyExpenses: 0,

  fetchTransactions: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const transactions = await transactionService.getAll(params);
      const { accounts } = get();
      const totals = calculateTotals(transactions, accounts);
      set({ transactions, ...totals, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addTransaction: async (transaction) => {
    set({ isLoading: true, error: null });
    try {
      const newTransaction = await transactionService.create(transaction);
      const transactions = [newTransaction, ...get().transactions];
      const { accounts } = get();
      const totals = calculateTotals(transactions, accounts);
      set({ transactions, ...totals, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateTransaction: async (id, transaction) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await transactionService.update(id, transaction);
      const transactions = get().transactions.map((t) =>
        t.id === id ? updated : t
      );
      const { accounts } = get();
      const totals = calculateTotals(transactions, accounts);
      set({ transactions, ...totals, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteTransaction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await transactionService.delete(id);
      const transactions = get().transactions.filter((t) => t.id !== id);
      const { accounts } = get();
      const totals = calculateTotals(transactions, accounts);
      set({ transactions, ...totals, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await categoryService.getAll();
      set({ categories });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  addCategory: async (category) => {
    try {
      const newCategory = await categoryService.create(category);
      set({ categories: [...get().categories, newCategory] });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  fetchAccounts: async () => {
    try {
      const accounts = await accountService.getAll();
      const { transactions } = get();
      const totals = calculateTotals(transactions, accounts);
      set({ accounts, ...totals });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  addAccount: async (account) => {
    set({ isLoading: true, error: null });
    try {
      const newAccount = await accountService.create(account);
      const accounts = [...get().accounts, newAccount];
      const { transactions } = get();
      const totals = calculateTotals(transactions, accounts);
      set({ accounts, ...totals, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateAccount: async (id, account) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await accountService.update(id, account);
      const accounts = get().accounts.map((a) => (a.id === id ? updated : a));
      const { transactions } = get();
      const totals = calculateTotals(transactions, accounts);
      set({ accounts, ...totals, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
