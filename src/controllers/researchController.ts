import { Request, Response } from 'express';
import { Person, ContextSnippet } from '../models';
// import { ResearchService } from '../services/ResearchService'; // ❌ Comment if unused
import researchQueue from '../queue/researchQueue';

export class ResearchController {
  public static async triggerResearch(req: Request, res: Response): Promise<void> {
    try {
      const { person_id } = req.params;

      const person = await Person.findByPk(person_id);
      if (!person) {
        res.status(404).json({ error: 'Person not found' });
        return;
      }

      const existingResearch = await ContextSnippet.findOne({
        where: {
          personId: person.id,
          companyId: person.companyId,
        },
        order: [['createdAt', 'DESC']],
      });

      if (existingResearch) {
        res.json({
          message: 'Research found in database',
          isExisting: true,
          data: existingResearch,
          jobId: null,
        });
        return;
      }

      const job = await researchQueue.add('research', {
        personId: person.id,
        companyId: person.companyId,
      });

      res.json({
        message: 'Research job started',
        isExisting: false,
        jobId: job.id,
      });
    } catch (error) {
      console.error('Failed to trigger research:', error);
      res.status(500).json({ error: 'Failed to trigger research' });
    }
  }

  public static async getJobStatus(req: Request, res: Response): Promise<void> {
    try {
      const { job_id } = req.params;
      console.log(`Getting status for job ${job_id}...`);

      const job = await researchQueue.getJob(job_id);
      if (!job) {
        res.status(404).json({ error: 'Job not found' });
        return;
      }

      const state = await job.getState();
      const progress = job.progress || 0;
      const result = job.returnValue ?? job.returnvalue;
      const data = job.data;
      const processingTime = job.processedOn ? Date.now() - job.processedOn : 0;

      res.json({
        id: job.id,
        state,
        progress,
        data,
        result,
        timestamps: {
          created: job.timestamp,
          started: job.processedOn,
          finished: job.finishedOn,
        },
        attempts: {
          current: job.attemptsMade,
          max: job.opts.attempts,
        },
      });
    } catch (error) {
      console.error('Failed to get job status:', error);
      res.status(500).json({ error: 'Failed to get job status' });
    }
  }

  public static async bulkUpdateResearchStatus(req: Request, res: Response): Promise<void> {
    const { personIds, status } = req.body;

    try {
      await Person.update(
        { researchStatus: status },
        {
          where: {
            id: personIds,
          },
        }
      );

      if (status === 'completed') {
        await ContextSnippet.destroy({
          where: {
            personId: personIds,
          },
        });
      }

      res.status(200).json({ message: 'Research status updated successfully' });
    } catch (error) {
      console.error('Error updating research status:', error);
      res.status(500).json({ error: 'Failed to update research status' });
    }
  }
}
