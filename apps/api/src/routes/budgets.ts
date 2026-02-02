import { Router, Response } from 'express';
import { body } from 'express-validator';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Get all budgets
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const budgets = await prisma.budget.findMany({
      where: { userId: req.userId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(budgets);
  } catch (error) {
    next(error);
  }
});

// Get current budgets
router.get('/current', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const now = new Date();

    const budgets = await prisma.budget.findMany({
      where: {
        userId: req.userId,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: { category: true },
    });

    res.json(budgets);
  } catch (error) {
    next(error);
  }
});

// Get budget by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const budget = await prisma.budget.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { category: true },
    });

    if (!budget) {
      throw new AppError('Budget non trovato', 404);
    }

    res.json(budget);
  } catch (error) {
    next(error);
  }
});

// Create budget
router.post(
  '/',
  authenticate,
  validate([
    body('amount').isNumeric().custom((value) => value > 0).withMessage('Importo deve essere positivo'),
    body('period').isIn(['weekly', 'monthly']).withMessage('Periodo non valido'),
  ]),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const { categoryId, amount, period } = req.body;

      // Calculate start and end dates based on period
      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      if (period === 'monthly') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      } else {
        // Weekly
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday
        startDate = new Date(now.setDate(diff));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
      }

      // Check if budget already exists for this category and period
      const existing = await prisma.budget.findFirst({
        where: {
          userId: req.userId,
          categoryId: categoryId || null,
          startDate: { lte: endDate },
          endDate: { gte: startDate },
        },
      });

      if (existing) {
        throw new AppError('Budget gia esistente per questo periodo', 400);
      }

      // Calculate current spent amount
      const transactions = await prisma.transaction.aggregate({
        where: {
          userId: req.userId,
          type: 'expense',
          date: { gte: startDate, lte: endDate },
          ...(categoryId && { categoryId }),
        },
        _sum: { amount: true },
      });

      const budget = await prisma.budget.create({
        data: {
          userId: req.userId!,
          categoryId,
          amount,
          spent: transactions._sum.amount || 0,
          period,
          startDate,
          endDate,
        },
        include: { category: true },
      });

      res.status(201).json(budget);
    } catch (error) {
      next(error);
    }
  }
);

// Update budget
router.put('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { amount } = req.body;

    const existing = await prisma.budget.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!existing) {
      throw new AppError('Budget non trovato', 404);
    }

    const budget = await prisma.budget.update({
      where: { id: req.params.id },
      data: { amount },
      include: { category: true },
    });

    res.json(budget);
  } catch (error) {
    next(error);
  }
});

// Delete budget
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const result = await prisma.budget.deleteMany({
      where: { id: req.params.id, userId: req.userId },
    });

    if (result.count === 0) {
      throw new AppError('Budget non trovato', 404);
    }

    res.json({ message: 'Budget eliminato' });
  } catch (error) {
    next(error);
  }
});

export default router;
