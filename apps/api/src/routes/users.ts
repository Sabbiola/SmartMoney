import { Router, Response } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        currency: true,
        language: true,
        theme: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('Utente non trovato', 404);
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Update current user
router.put(
  '/me',
  authenticate,
  validate([
    body('name').optional().notEmpty().withMessage('Nome non valido'),
    body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Valuta non valida'),
    body('language').optional().isLength({ min: 2, max: 5 }).withMessage('Lingua non valida'),
    body('theme').optional().isIn(['light', 'dark', 'system']).withMessage('Tema non valido'),
  ]),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const { name, avatarUrl, currency, language, theme } = req.body;

      const user = await prisma.user.update({
        where: { id: req.userId },
        data: {
          ...(name && { name }),
          ...(avatarUrl !== undefined && { avatarUrl }),
          ...(currency && { currency }),
          ...(language && { language }),
          ...(theme && { theme }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          currency: true,
          language: true,
          theme: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

// Update password
router.put(
  '/me/password',
  authenticate,
  validate([
    body('currentPassword').notEmpty().withMessage('Password attuale richiesta'),
    body('newPassword').isLength({ min: 8 }).withMessage('Nuova password deve essere almeno 8 caratteri'),
  ]),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await prisma.user.findUnique({ where: { id: req.userId } });
      if (!user) {
        throw new AppError('Utente non trovato', 404);
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        throw new AppError('Password attuale non corretta', 400);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await prisma.user.update({
        where: { id: req.userId },
        data: { password: hashedPassword },
      });

      res.json({ message: 'Password aggiornata' });
    } catch (error) {
      next(error);
    }
  }
);

// Delete account
router.delete('/me', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    await prisma.user.delete({ where: { id: req.userId } });
    res.json({ message: 'Account eliminato' });
  } catch (error) {
    next(error);
  }
});

export default router;
