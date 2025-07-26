import { Request, Response } from 'express';
import Campaign from '../models/Campaign';

export class CampaignController {
  // Get all campaigns
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

  // Create a new campaign
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

  // Get campaign by ID
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
