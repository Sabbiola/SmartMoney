import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';

const app = express();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Auth middleware
interface AuthRequest extends express.Request {
  userId?: string;
}

const authMiddleware = async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Token mancante' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Token non valido' });
  }
};

// ============ AUTH ROUTES ============
app.post('/api/auth/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, password, name } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email già registrata' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, currency: 'EUR', language: 'it', theme: 'dark' }
    });

    // Create default categories
    const defaultCategories = [
      { name: 'Cibo & Ristoranti', type: 'expense', icon: 'restaurant', color: '#FF5722', isDefault: true, userId: user.id },
      { name: 'Trasporti', type: 'expense', icon: 'car', color: '#2196F3', isDefault: true, userId: user.id },
      { name: 'Casa & Bollette', type: 'expense', icon: 'home', color: '#4CAF50', isDefault: true, userId: user.id },
      { name: 'Shopping', type: 'expense', icon: 'shopping-bag', color: '#E91E63', isDefault: true, userId: user.id },
      { name: 'Intrattenimento', type: 'expense', icon: 'film', color: '#9C27B0', isDefault: true, userId: user.id },
      { name: 'Salute', type: 'expense', icon: 'heart', color: '#F44336', isDefault: true, userId: user.id },
      { name: 'Altro', type: 'expense', icon: 'more-horizontal', color: '#9E9E9E', isDefault: true, userId: user.id },
      { name: 'Stipendio', type: 'income', icon: 'briefcase', color: '#4CAF50', isDefault: true, userId: user.id },
      { name: 'Freelance', type: 'income', icon: 'laptop', color: '#2196F3', isDefault: true, userId: user.id },
      { name: 'Investimenti', type: 'income', icon: 'trending-up', color: '#FF9800', isDefault: true, userId: user.id },
      { name: 'Altro', type: 'income', icon: 'more-horizontal', color: '#9E9E9E', isDefault: true, userId: user.id },
    ];
    await prisma.category.createMany({ data: defaultCategories as any });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
  } catch (error) {
    res.status(500).json({ error: 'Errore server' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
  } catch (error) {
    res.status(500).json({ error: 'Errore server' });
  }
});

// ============ ACCOUNTS ROUTES ============
app.get('/api/accounts', authMiddleware, async (req: AuthRequest, res) => {
  const accounts = await prisma.account.findMany({ where: { userId: req.userId, isActive: true } });
  res.json(accounts);
});

app.post('/api/accounts', authMiddleware, async (req: AuthRequest, res) => {
  const { name, type, balance, currency, color, icon } = req.body;
  const account = await prisma.account.create({
    data: { name, type, balance: balance || 0, currency: currency || 'EUR', color, icon, userId: req.userId!, isActive: true }
  });
  res.json(account);
});

// ============ CATEGORIES ROUTES ============
app.get('/api/categories', authMiddleware, async (req: AuthRequest, res) => {
  const categories = await prisma.category.findMany({ where: { userId: req.userId } });
  res.json(categories);
});

// ============ TRANSACTIONS ROUTES ============
app.get('/api/transactions', authMiddleware, async (req: AuthRequest, res) => {
  const transactions = await prisma.transaction.findMany({
    where: { userId: req.userId },
    include: { category: true, account: true },
    orderBy: { date: 'desc' },
    take: 100
  });
  res.json(transactions);
});

app.post('/api/transactions', authMiddleware, async (req: AuthRequest, res) => {
  const { type, amount, description, accountId, categoryId, date, currency, isRecurring } = req.body;

  const transaction = await prisma.transaction.create({
    data: {
      type, amount, description, accountId, categoryId,
      date: new Date(date), currency: currency || 'EUR',
      isRecurring: isRecurring || false, userId: req.userId!
    },
    include: { category: true, account: true }
  });

  // Update account balance
  const balanceChange = type === 'income' ? amount : -amount;
  await prisma.account.update({
    where: { id: accountId },
    data: { balance: { increment: balanceChange } }
  });

  res.json(transaction);
});

// ============ GOALS ROUTES ============
app.get('/api/goals', authMiddleware, async (req: AuthRequest, res) => {
  const goals = await prisma.savingsGoal.findMany({ where: { userId: req.userId } });
  res.json(goals);
});

app.post('/api/goals', authMiddleware, async (req: AuthRequest, res) => {
  const { name, targetAmount, targetDate, color, priority } = req.body;
  const goal = await prisma.savingsGoal.create({
    data: { name, targetAmount, targetDate: new Date(targetDate), color, priority: priority || 1, currentAmount: 0, isCompleted: false, userId: req.userId! }
  });
  res.json(goal);
});

app.post('/api/goals/:id/contribute', authMiddleware, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { amount, notes } = req.body;

  const goal = await prisma.savingsGoal.update({
    where: { id },
    data: { currentAmount: { increment: amount } }
  });

  await prisma.goalContribution.create({
    data: { goalId: id, amount, notes, date: new Date() }
  });

  if (goal.currentAmount >= goal.targetAmount) {
    await prisma.savingsGoal.update({
      where: { id },
      data: { isCompleted: true, completedAt: new Date() }
    });
  }

  res.json(goal);
});

// ============ BUDGETS ROUTES ============
app.get('/api/budgets/current', authMiddleware, async (req: AuthRequest, res) => {
  const now = new Date();
  const budgets = await prisma.budget.findMany({
    where: { userId: req.userId, startDate: { lte: now }, endDate: { gte: now } },
    include: { category: true }
  });
  res.json(budgets);
});

app.post('/api/budgets', authMiddleware, async (req: AuthRequest, res) => {
  const { categoryId, amount, period, startDate, endDate } = req.body;
  const budget = await prisma.budget.create({
    data: { categoryId, amount, period, startDate: new Date(startDate), endDate: new Date(endDate), spent: 0, userId: req.userId! },
    include: { category: true }
  });
  res.json(budget);
});

// ============ REPORTS ROUTES ============
app.get('/api/reports/summary', authMiddleware, async (req: AuthRequest, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const accounts = await prisma.account.findMany({ where: { userId: req.userId, isActive: true } });
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const monthlyTransactions = await prisma.transaction.findMany({
    where: { userId: req.userId, date: { gte: startOfMonth, lte: endOfMonth } }
  });

  const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const goals = await prisma.savingsGoal.findMany({ where: { userId: req.userId, isCompleted: false } });
  const totalSavings = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  res.json({ totalBalance, monthlyIncome, monthlyExpenses, totalSavings, savingsRate: monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0 });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;
