import { Request, Response } from 'express';
import { ContextSnippet } from '../models';

export class SnippetsController {
  public static async getByCompany(req: Request, res: Response): Promise<void> {
    try {
      const { company_id } = req.params;

      const snippets = await ContextSnippet.findAll({
        where: { companyId: company_id },
        include: ['company', 'person'],
      });

      if (!snippets.length) {
        res.status(404).json({ error: 'No snippets found for this company' });
        return;
      }

      res.json(snippets);
    } catch (error) {
      console.error('Failed to get snippets:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
