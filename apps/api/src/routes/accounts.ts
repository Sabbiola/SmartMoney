import { Router, Response } from 'express';
import { body, param } from 'express-validator';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Get all accounts
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const accounts = await prisma.account.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(accounts);
  } catch (error) {
    next(error);
  }
});

// Get account by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const account = await prisma.account.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!account) {
      throw new AppError('Conto non trovato', 404);
    }

    res.json(account);
  } catch (error) {
    next(error);
  }
});

// Create account
router.post(
  '/',
  authenticate,
  validate([
    body('name').notEmpty().withMessage('Nome richiesto'),
    body('type').isIn(['bank', 'cash', 'card', 'investment']).withMessage('Tipo non valido'),
    body('balance').optional().isNumeric().withMessage('Saldo deve essere un numero'),
  ]),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const { name, type, balance, currency, color, icon } = req.body;

      const account = await prisma.account.create({
        data: {
          userId: req.userId!,
          name,
          type,
          balance: balance || 0,
          currency: currency || 'EUR',
          color: color || '#4CAF50',
          icon: icon || 'wallet',
        },
      });

      res.status(201).json(account);
    } catch (error) {
      next(error);
    }
  }
);

// Update account
router.put(
  '/:id',
  authenticate,
  validate([
    param('id').isUUID().withMessage('ID non valido'),
    body('name').optional().notEmpty().withMessage('Nome non valido'),
    body('type').optional().isIn(['bank', 'cash', 'card', 'investment']).withMessage('Tipo non valido'),
  ]),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const { name, type, balance, currency, color, icon, isActive } = req.body;

      const account = await prisma.account.updateMany({
        where: { id: req.params.id, userId: req.userId },
        data: {
          ...(name && { name }),
          ...(type && { type }),
          ...(balance !== undefined && { balance }),
          ...(currency && { currency }),
          ...(color && { color }),
          ...(icon && { icon }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      if (account.count === 0) {
        throw new AppError('Conto non trovato', 404);
      }

      const updated = await prisma.account.findFirst({
        where: { id: req.params.id, userId: req.userId },
      });

      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
);

// Delete account
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const result = await prisma.account.deleteMany({
      where: { id: req.params.id, userId: req.userId },
    });

    if (result.count === 0) {
      throw new AppError('Conto non trovato', 404);
    }

    res.json({ message: 'Conto eliminato' });
  } catch (error) {
    next(error);
  }
});

// Transfer between accounts
router.post(
  '/transfer',
  authenticate,
  validate([
    body('fromAccountId').isUUID().withMessage('Account origine non valido'),
    body('toAccountId').isUUID().withMessage('Account destinazione non valido'),
    body('amount').isNumeric().custom((value) => value > 0).withMessage('Importo deve essere positivo'),
  ]),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const { fromAccountId, toAccountId, amount } = req.body;

      const [fromAccount, toAccount] = await Promise.all([
        prisma.account.findFirst({ where: { id: fromAccountId, userId: req.userId } }),
        prisma.account.findFirst({ where: { id: toAccountId, userId: req.userId } }),
      ]);

      if (!fromAccount || !toAccount) {
        throw new AppError('Uno o entrambi i conti non trovati', 404);
      }

      if (fromAccount.balance < amount) {
        throw new AppError('Saldo insufficiente', 400);
      }

      await prisma.$transaction([
        prisma.account.update({
          where: { id: fromAccountId },
          data: { balance: { decrement: amount } },
        }),
        prisma.account.update({
          where: { id: toAccountId },
          data: { balance: { increment: amount } },
        }),
      ]);

      res.json({ message: 'Trasferimento effettuato' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
