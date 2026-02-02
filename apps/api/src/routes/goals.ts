import { Router, Response } from 'express';
import { body } from 'express-validator';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Get all goals
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const goals = await prisma.savingsGoal.findMany({
      where: { userId: req.userId },
      orderBy: [{ isCompleted: 'asc' }, { priority: 'asc' }, { targetDate: 'asc' }],
    });

    res.json(goals);
  } catch (error) {
    next(error);
  }
});

// Get goal by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const goal = await prisma.savingsGoal.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: {
        contributions: {
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    });

    if (!goal) {
      throw new AppError('Obiettivo non trovato', 404);
    }

    res.json(goal);
  } catch (error) {
    next(error);
  }
});

// Create goal
router.post(
  '/',
  authenticate,
  validate([
    body('name').notEmpty().withMessage('Nome richiesto'),
    body('targetAmount').isNumeric().custom((value) => value > 0).withMessage('Importo deve essere positivo'),
    body('targetDate').isISO8601().withMessage('Data non valida'),
  ]),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const { name, targetAmount, targetDate, imageUrl, color, priority } = req.body;

      const goal = await prisma.savingsGoal.create({
        data: {
          userId: req.userId!,
          name,
          targetAmount,
          targetDate: new Date(targetDate),
          imageUrl,
          color: color || '#4CAF50',
          priority: priority || 1,
        },
      });

      res.status(201).json(goal);
    } catch (error) {
      next(error);
    }
  }
);

// Update goal
router.put('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { name, targetAmount, targetDate, imageUrl, color, priority } = req.body;

    const existing = await prisma.savingsGoal.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!existing) {
      throw new AppError('Obiettivo non trovato', 404);
    }

    const goal = await prisma.savingsGoal.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(targetAmount && { targetAmount }),
        ...(targetDate && { targetDate: new Date(targetDate) }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(color && { color }),
        ...(priority && { priority }),
      },
    });

    res.json(goal);
  } catch (error) {
    next(error);
  }
});

// Delete goal
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const result = await prisma.savingsGoal.deleteMany({
      where: { id: req.params.id, userId: req.userId },
    });

    if (result.count === 0) {
      throw new AppError('Obiettivo non trovato', 404);
    }

    res.json({ message: 'Obiettivo eliminato' });
  } catch (error) {
    next(error);
  }
});

// Add contribution to goal
router.post(
  '/:id/contribute',
  authenticate,
  validate([
    body('amount').isNumeric().custom((value) => value > 0).withMessage('Importo deve essere positivo'),
  ]),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const { amount, notes } = req.body;

      const goal = await prisma.savingsGoal.findFirst({
        where: { id: req.params.id, userId: req.userId },
      });

      if (!goal) {
        throw new AppError('Obiettivo non trovato', 404);
      }

      if (goal.isCompleted) {
        throw new AppError('Obiettivo gia completato', 400);
      }

      // Create contribution
      await prisma.goalContribution.create({
        data: {
          goalId: goal.id,
          amount,
          notes,
        },
      });

      // Update goal
      const newAmount = goal.currentAmount + amount;
      const isCompleted = newAmount >= goal.targetAmount;

      const updatedGoal = await prisma.savingsGoal.update({
        where: { id: goal.id },
        data: {
          currentAmount: newAmount,
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
        },
      });

      res.json(updatedGoal);
    } catch (error) {
      next(error);
    }
  }
);

// Get goal contributions
router.get('/:id/contributions', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const goal = await prisma.savingsGoal.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!goal) {
      throw new AppError('Obiettivo non trovato', 404);
    }

    const contributions = await prisma.goalContribution.findMany({
      where: { goalId: goal.id },
      orderBy: { date: 'desc' },
    });

    res.json(contributions);
  } catch (error) {
    next(error);
  }
});

export default router;
