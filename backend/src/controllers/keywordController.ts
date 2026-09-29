import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { BusinessService } from '../services/businessService.js';
import { KeywordService } from '../services/keywordService.js';

export class KeywordController {
  static async analyzeKeywords(req: AuthenticatedRequest, res: Response) {
    try {
      const { businessId, keywords } = req.body;
      if (!businessId || !keywords || !Array.isArray(keywords)) {
        return res.status(400).json({ error: 'businessId and an array of keywords are required.' });
      }

      const fullBusiness = await BusinessService.getBusinessById(businessId);
      if (!fullBusiness) {
        return res.status(404).json({ error: 'Business not found.' });
      }

      const results = await KeywordService.analyzeKeywords({
        businessId,
        keywords,
        category: fullBusiness.business.category,
        city: fullBusiness.location.city,
      });

      return res.json(results);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getKeywords(req: AuthenticatedRequest, res: Response) {
    try {
      const { businessId } = req.query;
      if (!businessId) {
        return res.status(400).json({ error: 'businessId is required.' });
      }

      const list = await KeywordService.getBusinessKeywords(businessId as string);
      return res.json(list);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}
