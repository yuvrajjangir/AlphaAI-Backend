import { Request, Response } from 'express';
import { JobEvents } from '../services/JobEvents';

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event streaming and updates
 */
export class EventsController {
  /**
   * @swagger
   * /events/jobs/{jobId}:
   *   get:
   *     summary: Stream job updates via Server-Sent Events (SSE)
   *     tags: [Events]
   *     parameters:
   *       - in: path
   *         name: jobId
   *         required: true
   *         schema:
   *           type: string
   *         description: Job ID to stream updates for
   *     responses:
   *       200:
   *         description: Stream of job updates
   *         content:
   *           text/event-stream:
   *             schema:
   *               type: string
   *       400:
   *         description: Job ID is required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  public static async streamJobUpdates(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { jobId } = req.params;

    if (!jobId) {
      res.status(400).json({ error: 'Job ID is required' });
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    const sendEvent = (data: any) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const jobEvents = JobEvents.getInstance();
    jobEvents.onJobProgress(jobId, sendEvent);

    req.on('close', () => {
      jobEvents.removeJobListeners(jobId);
    });
  }
}
