import { Request, Response } from 'express';
import { JobEvents } from '../services/JobEvents';

export class EventsController {
  public static async streamJobUpdates(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { jobId } = req.params;

    if (!jobId) {
      res.status(400).json({ error: 'Job ID is required' });
      return;
    }

    // Set headers for SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    // Helper function to send SSE data
    const sendEvent = (data: any) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Subscribe to job events
    const jobEvents = JobEvents.getInstance();
    jobEvents.onJobProgress(jobId, sendEvent);

    // Handle client disconnect
    req.on('close', () => {
      jobEvents.removeJobListeners(jobId);
    });
  }
}
