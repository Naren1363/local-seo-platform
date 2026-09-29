import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { CompetitorRepository } from '../repositories/competitorRepository.js';

export class CompetitorController {
  static async addCompetitor(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        business_id,
        name,
        category,
        website_url,
        address,
        latitude,
        longitude,
        distance_km,
        is_direct_competitor,
        rating,
        review_count,
        has_website,
        has_https,
        local_schema_present,
      } = req.body;

      if (!business_id || !name || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ error: 'business_id, name, latitude, and longitude are required.' });
      }

      const comp = await CompetitorRepository.addCompetitor(
        {
          business_id,
          name,
          category: category || 'Local Competitor',
          website_url: website_url || '',
          address: address || '',
          latitude,
          longitude,
          distance_km: distance_km || 1.0,
          is_direct_competitor: is_direct_competitor ?? true,
        },
        {
          rating: rating || 4.2,
          review_count: review_count || 45,
          has_website: has_website ?? !!website_url,
          has_https: has_https ?? (website_url?.startsWith('https') || false),
          local_schema_present: local_schema_present ?? false,
          estimated_seo_score: Math.floor(Math.random() * 30 + 55),
          keyword_overlap_score: Math.floor(Math.random() * 40 + 40),
        }
      );

      return res.status(201).json(comp);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getCompetitors(req: AuthenticatedRequest, res: Response) {
    try {
      const { businessId } = req.query;
      if (!businessId) {
        return res.status(400).json({ error: 'businessId is required.' });
      }

      const list = await CompetitorRepository.findByBusinessId(businessId as string);
      return res.json(list);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async deleteCompetitor(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { businessId } = req.query;
      if (!businessId) {
        return res.status(400).json({ error: 'businessId is required.' });
      }

      const success = await CompetitorRepository.deleteCompetitor(businessId as string, id);
      if (!success) return res.status(404).json({ error: 'Competitor not found.' });

      return res.json({ message: 'Competitor removed successfully.' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}
