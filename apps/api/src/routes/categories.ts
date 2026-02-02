import { Router, Response } from 'express';
import { body } from 'express-validator';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Default categories (seeded on first request)
const defaultCategories = [
  // Expenses
  { name: 'Cibo & Ristoranti', type: 'expense', icon: 'restaurant', color: '#FF5722' },
  { name: 'Trasporti', type: 'expense', icon: 'car', color: '#2196F3' },
  { name: 'Casa & Bollette', type: 'expense', icon: 'home', color: '#4CAF50' },
  { name: 'Shopping', type: 'expense', icon: 'shopping-bag', color: '#E91E63' },
  { name: 'Intrattenimento', type: 'expense', icon: 'film', color: '#9C27B0' },
  { name: 'Salute', type: 'expense', icon: 'heart', color: '#F44336' },
  { name: 'Sport & Fitness', type: 'expense', icon: 'dumbbell', color: '#00BCD4' },
  { name: 'Viaggi', type: 'expense', icon: 'plane', color: '#FF9800' },
  { name: 'Istruzione', type: 'expense', icon: 'book', color: '#3F51B5' },
  { name: 'Abbonamenti', type: 'expense', icon: 'credit-card', color: '#607D8B' },
  { name: 'Altro', type: 'expense', icon: 'more-horizontal', color: '#9E9E9E' },
  // Income
  { name: 'Stipendio', type: 'income', icon: 'briefcase', color: '#4CAF50' },
  { name: 'Freelance', type: 'income', icon: 'laptop', color: '#2196F3' },
  { name: 'Investimenti', type: 'income', icon: 'trending-up', color: '#FF9800' },
  { name: 'Affitto', type: 'income', icon: 'home', color: '#9C27B0' },
  { name: 'Regalo', type: 'income', icon: 'gift', color: '#E91E63' },
  { name: 'Altro', type: 'income', icon: 'more-horizontal', color: '#9E9E9E' },
];

// Get all categories
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    // Get user categories and default categories
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { userId: req.userId },
          { isDefault: true },
        ],
      },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });

    // If no default categories exist, create them
    if (!categories.some((c) => c.isDefault)) {
      await prisma.category.createMany({
        data: defaultCategories.map((c) => ({ ...c, isDefault: true })),
      });

      const updatedCategories = await prisma.category.findMany({
        where: {
          OR: [
            { userId: req.userId },
            { isDefault: true },
          ],
        },
        orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
      });

      res.json(updatedCategories);
      return;
    }

    res.json(categories);
  } catch (error) {
    next(error);
  }
});

// Create category
router.post(
  '/',
  authenticate,
  validate([
    body('name').notEmpty().withMessage('Nome richiesto'),
    body('type').isIn(['income', 'expense']).withMessage('Tipo non valido'),
    body('icon').notEmpty().withMessage('Icona richiesta'),
    body('color').notEmpty().withMessage('Colore richiesto'),
  ]),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const { name, type, icon, color, parentId } = req.body;

      const category = await prisma.category.create({
        data: {
          userId: req.userId!,
          name,
          type,
          icon,
          color,
          parentId,
          isDefault: false,
        },
      });

      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  }
);

// Update category
router.put('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { name, icon, color } = req.body;

    const category = await prisma.category.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!category) {
      throw new AppError('Categoria non trovata o non modificabile', 404);
    }

    const updated = await prisma.category.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(icon && { icon }),
        ...(color && { color }),
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Delete category
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const category = await prisma.category.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!category) {
      throw new AppError('Categoria non trovata o non eliminabile', 404);
    }

    await prisma.category.delete({ where: { id: req.params.id } });

    res.json({ message: 'Categoria eliminata' });
  } catch (error) {
    next(error);
  }
});

export default router;
