import { Request, Response } from 'express';
import { Company } from '../models';

export class CompanyController {
  public static async listAll(req: Request, res: Response): Promise<void> {
    try {
      const companies = await Company.findAll();
      res.json(companies);
    } catch (error) {
      console.error('Failed to list companies:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

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
