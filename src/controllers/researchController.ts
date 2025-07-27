import { Request, Response } from 'express';
import { Person, ContextSnippet } from '../models';
// import { ResearchService } from '../services/ResearchService'; // ❌ Comment if unused
import researchQueue from '../queue/researchQueue';

/**
 * @swagger
 * tags:
 *   name: Research
 *   description: Research management and operations
 */
export class ResearchController {
  /**
   * @swagger
   * /api/research/{person_id}:
   *   post:
   *     summary: Trigger research for a person
   *     tags: [Research]
   *     parameters:
   *       - in: path
   *         name: person_id
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the person to research
   *     responses:
   *       200:
   *         description: Research started or existing research found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 isExisting:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/ContextSnippet'
   *                 jobId:
   *                   type: string
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalError'
   */
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

  /**
   * @swagger
   * /api/research/jobs/{job_id}:
   *   get:
   *     summary: Get the status of a research job
   *     tags: [Research]
   *     parameters:
   *       - in: path
   *         name: job_id
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the job to check
   *     responses:
   *       200:
   *         description: Job status retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                 state:
   *                   type: string
   *                 progress:
   *                   type: number
   *                 data:
   *                   type: object
   *                 result:
   *                   type: object
   *                 timestamps:
   *                   type: object
   *                   properties:
   *                     created:
   *                       type: number
   *                     started:
   *                       type: number
   *                     finished:
   *                       type: number
   *                 attempts:
   *                   type: object
   *                   properties:
   *                     current:
   *                       type: number
   *                     max:
   *                       type: number
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalError'
   */
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

  /**
   * @swagger
   * /api/research/status:
   *   put:
   *     summary: Bulk update research status for multiple people
   *     tags: [Research]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               personIds:
   *                 type: array
   *                 items:
   *                   type: number
   *               status:
   *                 type: string
   *             required:
   *               - personIds
   *               - status
   *     responses:
   *       200:
   *         description: Research status updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       500:
   *         $ref: '#/components/responses/InternalError'
   */
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
