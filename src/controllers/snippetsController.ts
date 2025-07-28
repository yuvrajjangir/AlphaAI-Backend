import { Request, Response } from 'express';
import { ContextSnippet } from '../models';

/**
 * @swagger
 * tags:
 *   name: Snippets
 *   description: Context snippets management
 */
export class SnippetsController {
  /**
   * @swagger
   * /snippets/company/{company_id}:
   *   get:
   *     summary: Get snippets by company ID
   *     tags: [Snippets]
   *     parameters:
   *       - in: path
   *         name: company_id
   *         required: true
   *         schema:
   *           type: string
   *         description: Company ID
   *     responses:
   *       200:
   *         description: List of context snippets
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/ContextSnippet'
   *       404:
   *         description: No snippets found for this company
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         $ref: '#/components/responses/InternalError'
   */
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
