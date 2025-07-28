import { Request, Response } from 'express';
import Campaign from '../models/Campaign';

/**
 * @swagger
 * tags:
 *   name: Campaigns
 *   description: Campaign management
 */
export class CampaignController {
  /**
   * @swagger
   * /campaigns:
   *   get:
   *     summary: Get all campaigns
   *     tags: [Campaigns]
   *     security:
   *       - ApiKeyAuth: []
   *     responses:
   *       200:
   *         description: List of campaigns
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Campaign'
   *       500:
   *         $ref: '#/components/responses/InternalError'
   */
  public static async listAll(req: Request, res: Response): Promise<void> {
    try {
      const campaigns = await Campaign.findAll({
        order: [['createdAt', 'DESC']],
      });
      res.json(campaigns);
    } catch (error) {
      console.error('Failed to list campaigns:', error);
      res.status(500).json({ error: 'Failed to list campaigns' });
    }
  }

  /**
   * @swagger
   * /campaigns:
   *   post:
   *     summary: Create a new campaign
   *     tags: [Campaigns]
   *     security:
   *       - ApiKeyAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *             properties:
   *               name:
   *                 type: string
   *                 description: Campaign name
   *     responses:
   *       201:
   *         description: Campaign created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Campaign'
   *       400:
   *         description: Campaign name is required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         $ref: '#/components/responses/InternalError'
   */
  public static async create(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.body;

      if (!name) {
        res.status(400).json({ error: 'Campaign name is required' });
        return;
      }

      const campaign = await Campaign.create({
        name,
      });

      res.status(201).json(campaign);
    } catch (error) {
      console.error('Failed to create campaign:', error);
      res.status(500).json({ error: 'Failed to create campaign' });
    }
  }

  /**
   * @swagger
   * /campaigns/{id}:
   *   get:
   *     summary: Get campaign by ID
   *     tags: [Campaigns]
   *     security:
   *       - ApiKeyAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: Campaign ID
   *     responses:
   *       200:
   *         description: Campaign data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Campaign'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalError'
   */
  public static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const campaign = await Campaign.findByPk(id);

      if (!campaign) {
        res.status(404).json({ error: 'Campaign not found' });
        return;
      }

      res.json(campaign);
    } catch (error) {
      console.error('Failed to get campaign:', error);
      res.status(500).json({ error: 'Failed to get campaign' });
    }
  }
}
