import { Request, Response } from 'express';
import { Queue } from 'bullmq';
import sequelize from '../config/database';

export class HealthController {
  public static async check(req: Request, res: Response): Promise<void> {
    try {
      // Check database connection
      await sequelize.query('SELECT 1');


      // Check Redis connection
      const queue = req.app.locals.enrichQueue as Queue;
      const redis = await queue.client; // ✅ Await the client
      await redis.ping(); // ✅ Then ping it

      res.json({
        status: 'healthy',
        services: {
          database: 'connected',
          redis: 'connected',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Health check failed:', error);
      res.status(503).json({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
