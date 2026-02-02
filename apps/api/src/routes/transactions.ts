import { Router, Response } from 'express';
import { body, query } from 'express-validator';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Get all transactions
router.get(
  '/',
  authenticate,
  async (req: AuthRequest, res: Response, next) => {
    try {
      const { startDate, endDate, categoryId, type, limit, offset } = req.query;

      const where: any = { userId: req.userId };

      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate as string);
        if (endDate) where.date.lte = new Date(endDate as string);
      }

      if (categoryId) where.categoryId = categoryId;
      if (type) where.type = type;

      const transactions = await prisma.transaction.findMany({
        where,
        include: {
          category: true,
          account: true,
        },
        orderBy: { date: 'desc' },
        take: limit ? parseInt(limit as string) : 100,
        skip: offset ? parseInt(offset as string) : 0,
      });

      res.json(transactions);
    } catch (error) {
      next(error);
    }
  }
);

// Get transaction by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const transaction = await prisma.transaction.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: {
        category: true,
        account: true,
      },
    });

    if (!transaction) {
      throw new AppError('Transazione non trovata', 404);
    }

    res.json(transaction);
  } catch (error) {
    next(error);
  }
});

// Create transaction
router.post(
  '/',
  authenticate,
  validate([
    body('type').isIn(['income', 'expense', 'transfer']).withMessage('Tipo non valido'),
    body('amount').isNumeric().custom((value) => value > 0).withMessage('Importo deve essere positivo'),
    body('description').notEmpty().withMessage('Descrizione richiesta'),
    body('categoryId').notEmpty().withMessage('Categoria richiesta'),
    body('accountId').notEmpty().withMessage('Conto richiesto'),
    body('date').optional().isISO8601().withMessage('Data non valida'),
  ]),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const {
        type,
        amount,
        description,
        categoryId,
        accountId,
        currency,
        notes,
        date,
        location,
        attachments,
        tags,
      } = req.body;

      // Verify account belongs to user
      const account = await prisma.account.findFirst({
        where: { id: accountId, userId: req.userId },
      });

      if (!account) {
        throw new AppError('Conto non trovato', 404);
      }

      // Create transaction
      const transaction = await prisma.transaction.create({
        data: {
          userId: req.userId!,
          type,
          amount,
          description,
          categoryId,
          accountId,
          currency: currency || 'EUR',
          notes,
          date: date ? new Date(date) : new Date(),
          location,
          attachments,
          tags,
          isRecurring: false,
        },
        include: {
          category: true,
          account: true,
        },
      });

      // Update account balance
      const balanceChange = type === 'income' ? amount : -amount;
      await prisma.account.update({
        where: { id: accountId },
        data: { balance: { increment: balanceChange } },
      });

      // Update budget spent if expense
      if (type === 'expense') {
        const now = new Date();
        await prisma.budget.updateMany({
          where: {
            userId: req.userId,
            OR: [
              { categoryId: categoryId },
              { categoryId: null }, // Global budget
            ],
            startDate: { lte: now },
            endDate: { gte: now },
          },
          data: { spent: { increment: amount } },
        });
      }

      res.status(201).json(transaction);
    } catch (error) {
      next(error);
    }
  }
);

// Update transaction
router.put('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { description, notes, date, categoryId, tags } = req.body;

    const existing = await prisma.transaction.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!existing) {
      throw new AppError('Transazione non trovata', 404);
    }

    const transaction = await prisma.transaction.update({
      where: { id: req.params.id },
      data: {
        ...(description && { description }),
        ...(notes !== undefined && { notes }),
        ...(date && { date: new Date(date) }),
        ...(categoryId && { categoryId }),
        ...(tags && { tags }),
      },
      include: {
        category: true,
        account: true,
      },
    });

    res.json(transaction);
  } catch (error) {
    next(error);
  }
});

// Delete transaction
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const transaction = await prisma.transaction.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!transaction) {
      throw new AppError('Transazione non trovata', 404);
    }

    // Revert account balance
    const balanceChange = transaction.type === 'income' ? -transaction.amount : transaction.amount;
    await prisma.account.update({
      where: { id: transaction.accountId },
      data: { balance: { increment: balanceChange } },
    });

    // Revert budget spent if expense
    if (transaction.type === 'expense') {
      await prisma.budget.updateMany({
        where: {
          userId: req.userId,
          OR: [
            { categoryId: transaction.categoryId },
            { categoryId: null },
          ],
          startDate: { lte: transaction.date },
          endDate: { gte: transaction.date },
        },
        data: { spent: { decrement: transaction.amount } },
      });
    }

    await prisma.transaction.delete({ where: { id: req.params.id } });

    res.json({ message: 'Transazione eliminata' });
  } catch (error) {
    next(error);
  }
});

export default router;
