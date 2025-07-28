import { Request, Response } from 'express';
import { Queue } from 'bullmq';
import sequelize from '../config/database';

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Health check endpoints
 */
export class HealthController {
  /**
   * @swagger
   * /healthz:
   *   get:
   *     summary: Health check endpoint
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: Service is healthy
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                 services:
   *                   type: object
   *                   properties:
   *                     database:
   *                       type: string
   *                     redis:
   *                       type: string
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       503:
   *         description: Service is unhealthy
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                 error:
   *                   type: string
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   */
  public static async check(req: Request, res: Response): Promise<void> {
    try {
      // Check database connection
      await sequelize.query('SELECT 1');

      // Check Redis connection
      const queue = req.app.locals.researchQueue as Queue;
      if (!queue) {
        res.status(503).json({
          status: 'unhealthy',
          error: 'Redis queue not initialized',
          timestamp: new Date().toISOString(),
        });
        return;
      }
      const redis = await queue.client;
      await redis.ping();

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
