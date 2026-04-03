import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  // Zod validation error
  if (err && typeof err === 'object' && 'issues' in err) {
    const zodErr = err as { issues: Array<{ path: (string | number)[]; message: string }> };
    const errors = zodErr.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors,
    });
    return;
  }

  if (err instanceof Error) {
    if (err.name === 'CastError') {
      res.status(400).json({
        success: false,
        message: 'Invalid ID format',
      });
      return;
    }

    if (err.name === 'MongoServerError' && (err as unknown as Record<string, unknown>).code === 11000) {
      res.status(409).json({
        success: false,
        message: 'Duplicate entry. This record already exists.',
      });
      return;
    }
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};
