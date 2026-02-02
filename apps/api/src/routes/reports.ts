import { Router, Response } from 'express';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get dashboard summary
router.get('/summary', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Get current month transactions
    const currentMonthTx = await prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId: req.userId,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    });

    // Get last month transactions for comparison
    const lastMonthTx = await prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId: req.userId,
        date: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { amount: true },
    });

    // Get total balance
    const accounts = await prisma.account.aggregate({
      where: { userId: req.userId, isActive: true },
      _sum: { balance: true },
    });

    // Get total savings (from goals)
    const goals = await prisma.savingsGoal.aggregate({
      where: { userId: req.userId },
      _sum: { currentAmount: true },
    });

    const monthlyIncome = currentMonthTx.find((t) => t.type === 'income')?._sum.amount || 0;
    const monthlyExpenses = currentMonthTx.find((t) => t.type === 'expense')?._sum.amount || 0;
    const lastMonthIncome = lastMonthTx.find((t) => t.type === 'income')?._sum.amount || 0;
    const lastMonthExpenses = lastMonthTx.find((t) => t.type === 'expense')?._sum.amount || 0;

    const savingsRate = monthlyIncome > 0
      ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100
      : 0;

    const incomeChange = lastMonthIncome > 0
      ? ((monthlyIncome - lastMonthIncome) / lastMonthIncome) * 100
      : 0;

    const expenseChange = lastMonthExpenses > 0
      ? ((monthlyExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
      : 0;

    res.json({
      totalBalance: accounts._sum.balance || 0,
      totalSavings: goals._sum.currentAmount || 0,
      monthlyIncome,
      monthlyExpenses,
      savingsRate,
      incomeChange,
      expenseChange,
    });
  } catch (error) {
    next(error);
  }
});

// Get expenses by category
router.get('/expenses', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { startDate, endDate } = req.query;

    const now = new Date();
    const start = startDate ? new Date(startDate as string) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate as string) : new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const expenses = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId: req.userId,
        type: 'expense',
        date: { gte: start, lte: end },
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
    });

    // Get category details
    const categoryIds = expenses.map((e) => e.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });

    const result = expenses.map((expense) => {
      const category = categories.find((c) => c.id === expense.categoryId);
      return {
        categoryId: expense.categoryId,
        categoryName: category?.name || 'Altro',
        categoryColor: category?.color || '#9E9E9E',
        categoryIcon: category?.icon || 'more-horizontal',
        amount: expense._sum.amount || 0,
      };
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get income by category
router.get('/income', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { startDate, endDate } = req.query;

    const now = new Date();
    const start = startDate ? new Date(startDate as string) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate as string) : new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const income = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId: req.userId,
        type: 'income',
        date: { gte: start, lte: end },
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
    });

    const categoryIds = income.map((i) => i.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });

    const result = income.map((inc) => {
      const category = categories.find((c) => c.id === inc.categoryId);
      return {
        categoryId: inc.categoryId,
        categoryName: category?.name || 'Altro',
        categoryColor: category?.color || '#9E9E9E',
        amount: inc._sum.amount || 0,
      };
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get monthly trend
router.get('/trend', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const months = parseInt(req.query.months as string) || 6;
    const now = new Date();
    const result = [];

    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const transactions = await prisma.transaction.groupBy({
        by: ['type'],
        where: {
          userId: req.userId,
          date: { gte: start, lte: end },
        },
        _sum: { amount: true },
      });

      const income = transactions.find((t) => t.type === 'income')?._sum.amount || 0;
      const expenses = transactions.find((t) => t.type === 'expense')?._sum.amount || 0;

      result.push({
        month: start.toISOString().slice(0, 7),
        monthName: start.toLocaleDateString('it-IT', { month: 'short' }),
        income,
        expenses,
        savings: income - expenses,
      });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
