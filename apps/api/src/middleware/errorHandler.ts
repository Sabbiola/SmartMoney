import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  // Prisma errors
  if ((err as any).code === 'P2002') {
    res.status(400).json({
      error: 'Un record con questi dati esiste gia',
    });
    return;
  }

  if ((err as any).code === 'P2025') {
    res.status(404).json({
      error: 'Record non trovato',
    });
    return;
  }

  res.status(500).json({
    error: 'Errore interno del server',
  });
};
