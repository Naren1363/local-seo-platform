import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { BusinessService } from '../services/businessService.js';

export class BusinessController {
  static async createBusiness(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

      const { name, website_url, category, address, city, state, country, target_keywords } = req.body;

      const business = await BusinessService.createBusiness({
        userId: req.user.userId,
        name,
        website_url,
        category,
        address,
        city,
        state,
        country,
        target_keywords: Array.isArray(target_keywords)
          ? target_keywords
          : typeof target_keywords === 'string'
          ? target_keywords.split(',').map(s => s.trim())
          : [],
      });

      return res.status(201).json(business);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getUserBusinesses(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

      const list = await BusinessService.getUserBusinesses(req.user.userId);
      return res.json(list);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getBusinessById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const business = await BusinessService.getBusinessById(id);
      if (!business) return res.status(404).json({ error: 'Business not found.' });

      return res.json(business);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}
