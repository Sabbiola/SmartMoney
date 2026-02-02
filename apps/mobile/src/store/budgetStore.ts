import { create } from 'zustand';
import { Budget, SavingsGoal, GoalContribution } from '../types';
import { budgetService, goalService } from '../services/api';

interface BudgetState {
  budgets: Budget[];
  goals: SavingsGoal[];
  isLoading: boolean;
  error: string | null;

  // Budget actions
  fetchBudgets: () => Promise<void>;
  addBudget: (budget: Omit<Budget, 'id' | 'userId' | 'spent'>) => Promise<void>;
  updateBudget: (id: string, budget: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  // Goal actions
  fetchGoals: () => Promise<void>;
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'userId' | 'currentAmount' | 'isCompleted' | 'completedAt' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateGoal: (id: string, goal: Partial<SavingsGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  contributeToGoal: (goalId: string, amount: number, notes?: string) => Promise<void>;

  clearError: () => void;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgets: [],
  goals: [],
  isLoading: false,
  error: null,

  // Budget actions
  fetchBudgets: async () => {
    set({ isLoading: true, error: null });
    try {
      const budgets = await budgetService.getAll();
      set({ budgets, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addBudget: async (budget) => {
    set({ isLoading: true, error: null });
    try {
      const newBudget = await budgetService.create(budget);
      set({ budgets: [...get().budgets, newBudget], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateBudget: async (id, budget) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await budgetService.update(id, budget);
      const budgets = get().budgets.map((b) => (b.id === id ? updated : b));
      set({ budgets, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteBudget: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await budgetService.delete(id);
      const budgets = get().budgets.filter((b) => b.id !== id);
      set({ budgets, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Goal actions
  fetchGoals: async () => {
    set({ isLoading: true, error: null });
    try {
      const goals = await goalService.getAll();
      set({ goals, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addGoal: async (goal) => {
    set({ isLoading: true, error: null });
    try {
      const newGoal = await goalService.create(goal);
      set({ goals: [...get().goals, newGoal], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateGoal: async (id, goal) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await goalService.update(id, goal);
      const goals = get().goals.map((g) => (g.id === id ? updated : g));
      set({ goals, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteGoal: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await goalService.delete(id);
      const goals = get().goals.filter((g) => g.id !== id);
      set({ goals, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  contributeToGoal: async (goalId, amount, notes) => {
    set({ isLoading: true, error: null });
    try {
      const updatedGoal = await goalService.contribute(goalId, amount, notes);
      const goals = get().goals.map((g) => (g.id === goalId ? updatedGoal : g));
      set({ goals, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
