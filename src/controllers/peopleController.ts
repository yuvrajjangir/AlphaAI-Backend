import { Request, Response } from 'express';
import Person from '../models/Person';
import Company from '../models/Company';
import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';
import { ContextSnippet } from '../models';

/**
 * @swagger
 * tags:
 *   name: People
 *   description: People management
 */
const researchQueue = new Queue('research', { connection: redisConnection });

export class PeopleController {
  /**
   * @swagger
   * /people:
   *   get:
   *     summary: Get all people
   *     tags: [People]
   *     security:
   *       - ApiKeyAuth: []
   *     responses:
   *       200:
   *         description: List of people
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Person'
   *       500:
   *         $ref: '#/components/responses/InternalError'
   */
  public static async listAll(req: Request, res: Response): Promise<void> {
    try {
      const people = await Person.findAll({
        include: ['company'],
      });
      res.json(people);
    } catch (error) {
      console.error('Failed to list people:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * @swagger
   * /people:
   *   post:
   *     summary: Create a new person
   *     tags: [People]
   *     security:
   *       - ApiKeyAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - full_name
   *               - email
   *               - company_id
   *             properties:
   *               full_name:
   *                 type: string
   *                 description: Full name of the person
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Email address
   *               company_id:
   *                 type: integer
   *                 description: ID of the company
   *               title:
   *                 type: string
   *                 description: Job title
   *     responses:
   *       201:
   *         description: Person created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Person'
   *       400:
   *         description: Missing required fields
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Company not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         $ref: '#/components/responses/InternalError'
   */
  public static async create(req: Request, res: Response): Promise<void> {
    try {
      // Validate required fields in request body
      if (!req.body.full_name) {
        res.status(400).json({ error: 'full_name is required' });
        return;
      }
      if (!req.body.email) {
        res.status(400).json({ error: 'email is required' });
        return;
      }
      if (!req.body.company_id) {
        res.status(400).json({ error: 'company_id is required' });
        return;
      }

      // Parse and validate company ID
      const companyId = parseInt(req.body.company_id, 10);

      // Check if company exists
      const company = await Company.findByPk(companyId);

      // Prepare person data with validated fields using camelCase as per model
      const personData = {
        companyId: companyId,
        fullName: req.body.full_name,
        email: req.body.email,
        title: req.body.title || null,
      };
      if (!company) {
        res.status(404).json({
          error: `Company with ID ${personData.companyId} not found. Please create the company first.`,
          suggestion: 'POST /api/companies with the company details',
        });
        return;
      }

      // Create the new person
      const person = await Person.create(personData);

      // Return person with company info
      const personWithCompany = await Person.findByPk(person.id, {
        include: [
          {
            model: Company,
            as: 'company',
          },
        ],
      });

      res.status(201).json(personWithCompany);
    } catch (error) {
      console.error('Failed to create person:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * @swagger
   * /enrich/{person_id}:
   *   post:
   *     summary: Trigger enrichment research for a person
   *     tags: [People]
   *     security:
   *       - ApiKeyAuth: []
   *     parameters:
   *       - in: path
   *         name: person_id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the person to enrich
   *     responses:
   *       200:
   *         description: Research started
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 jobId:
   *                   type: string
   *                 person:
   *                   $ref: '#/components/schemas/Person'
   *                 company:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                     name:
   *                       type: string
   *       404:
   *         description: Person not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       400:
   *         description: Person must be associated with a company
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         $ref: '#/components/responses/InternalError'
   */
  public static async triggerEnrichment(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { person_id } = req.params;

      const person = await Person.findByPk(person_id, {
        include: ['company'],
      });

      if (!person) {
        res.status(404).json({ error: 'Person not found' });
        return;
      }

      if (!person.company) {
        res
          .status(400)
          .json({ error: 'Person must be associated with a company' });
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

      // Add job to research queue
      const job = await researchQueue.add('research', {
        personId: parseInt(person_id),
        companyId: person.company.id,
      });

      res.json({
        message: 'Research started',
        jobId: job.id,
        person: {
          id: person.id,
          fullName: person.full_name,
          email: person.email,
        },
        company: {
          id: person.company.id,
          name: person.company.name,
        },
      });
    } catch (error) {
      console.error('Failed to trigger enrichment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
