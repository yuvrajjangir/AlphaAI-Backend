import { Request, Response, NextFunction } from 'express';

const AUTH_API_KEY = process.env.AUTH_API_KEY;

export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.header('x-api-key') || (req.query.apiKey as string | undefined);

  if (!apiKey || apiKey !== AUTH_API_KEY) {
    return res
      .status(401)
      .json({ error: 'Unauthorized: Invalid or missing API key' });
  }

  next();
};
