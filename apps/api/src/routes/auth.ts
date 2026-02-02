import { Router, Response } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import config from '../config';
import { validate } from '../middleware/validate';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Register
router.post(
  '/register',
  validate([
    body('email').isEmail().withMessage('Email non valida'),
    body('password').isLength({ min: 8 }).withMessage('Password deve essere almeno 8 caratteri'),
    body('name').notEmpty().withMessage('Nome richiesto'),
  ]),
  async (req, res, next) => {
    try {
      const { email, password, name } = req.body;

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new AppError('Email gia registrata', 400);
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
        select: {
          id: true,
          email: true,
          name: true,
          currency: true,
          language: true,
          theme: true,
          createdAt: true,
        },
      });

      // Create default account
      await prisma.account.create({
        data: {
          userId: user.id,
          name: 'Conto Principale',
          type: 'bank',
          balance: 0,
          color: '#4CAF50',
          icon: 'wallet',
        },
      });

      const token = jwt.sign({ userId: user.id }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
      });

      res.status(201).json({ user, token });
    } catch (error) {
      next(error);
    }
  }
);

// Login
router.post(
  '/login',
  validate([
    body('email').isEmail().withMessage('Email non valida'),
    body('password').notEmpty().withMessage('Password richiesta'),
  ]),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new AppError('Credenziali non valide', 401);
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new AppError('Credenziali non valide', 401);
      }

      const token = jwt.sign({ userId: user.id }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
      });

      const { password: _, ...userWithoutPassword } = user;

      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      next(error);
    }
  }
);

// Logout
router.post('/logout', authenticate, (req: AuthRequest, res: Response) => {
  res.json({ message: 'Logout effettuato' });
});

// Refresh token
router.post('/refresh-token', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const token = jwt.sign({ userId: req.userId }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    res.json({ token });
  } catch (error) {
    next(error);
  }
});

export default router;
