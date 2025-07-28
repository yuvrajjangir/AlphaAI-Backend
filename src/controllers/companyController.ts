import { Request, Response } from 'express';
import { Company } from '../models';

/**
 * @swagger
 * tags:
 *   name: Companies
 *   description: Company management
 */
export class CompanyController {
  /**
   * @swagger
   * /companies:
   *   get:
   *     summary: Get all companies
   *     tags: [Companies]
   *     security:
   *       - ApiKeyAuth: []
   *     responses:
   *       200:
   *         description: List of companies
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Company'
   *       500:
   *         $ref: '#/components/responses/InternalError'
   */
  public static async listAll(req: Request, res: Response): Promise<void> {
    try {
      const companies = await Company.findAll();
      res.json(companies);
    } catch (error) {
      console.error('Failed to list companies:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * @swagger
   * /companies:
   *   post:
   *     summary: Create a new company
   *     tags: [Companies]
   *     security:
   *       - ApiKeyAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Company'
   *     responses:
   *       201:
   *         description: Company created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Company'
   *       500:
   *         $ref: '#/components/responses/InternalError'
   */
  public static async create(req: Request, res: Response): Promise<void> {
    try {
      const companyData = req.body;
      const company = await Company.create(companyData);
      res.status(201).json(company);
    } catch (error) {
      console.error('Failed to create company:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * @swagger
   * /companies/{id}:
   *   get:
   *     summary: Get company by ID
   *     tags: [Companies]
   *     security:
   *       - ApiKeyAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: Company ID
   *     responses:
   *       200:
   *         description: Company data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Company'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalError'
   */
  public static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const company = await Company.findByPk(id);

      if (!company) {
        res.status(404).json({ error: 'Company not found' });
        return;
      }

      res.json(company);
    } catch (error) {
      console.error('Failed to get company:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
