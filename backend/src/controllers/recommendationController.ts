import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { BusinessService } from '../services/businessService.js';
import { RecommendationEngine } from '../services/recommendationEngine.js';
import { AuditRepository } from '../repositories/auditRepository.js';
import { CompetitorRepository } from '../repositories/competitorRepository.js';

export class RecommendationController {
  static async getRecommendations(req: AuthenticatedRequest, res: Response) {
    try {
      const { businessId } = req.query;
      if (!businessId) {
        return res.status(400).json({ error: 'businessId is required.' });
      }

      let recs = await RecommendationEngine.getRecommendations(businessId as string);

      if (recs.length === 0) {
        const fullBusiness = await BusinessService.getBusinessById(businessId as string);
        if (fullBusiness) {
          const auditData = await AuditRepository.getLatestAuditByBusinessId(businessId as string);
          const competitors = await CompetitorRepository.findByBusinessId(businessId as string);

          recs = await RecommendationEngine.generateRecommendations({
            businessId: businessId as string,
            businessName: fullBusiness.business.name,
            city: fullBusiness.location.city,
            auditData,
            competitors,
          });
        }
      }

      return res.json(recs);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async updateStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status) return res.status(400).json({ error: 'status is required.' });

      const success = await RecommendationEngine.updateStatus(id, status);
      if (!success) return res.status(404).json({ error: 'Recommendation not found.' });

      return res.json({ message: 'Recommendation status updated successfully.' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}
