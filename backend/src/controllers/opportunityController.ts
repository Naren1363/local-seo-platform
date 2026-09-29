import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { BusinessService } from '../services/businessService.js';
import { OpportunityDetector } from '../services/opportunityDetector.js';
import { AuditRepository } from '../repositories/auditRepository.js';

export class OpportunityController {
  static async getOpportunities(req: AuthenticatedRequest, res: Response) {
    try {
      const { businessId } = req.query;
      if (!businessId) {
        return res.status(400).json({ error: 'businessId is required.' });
      }

      const fullBusiness = await BusinessService.getBusinessById(businessId as string);
      if (!fullBusiness) {
        return res.status(404).json({ error: 'Business not found.' });
      }

      const auditData = await AuditRepository.getLatestAuditByBusinessId(businessId as string);

      const opportunities = OpportunityDetector.detectOpportunities({
        businessName: fullBusiness.business.name,
        city: fullBusiness.location.city,
        category: fullBusiness.business.category,
        keywords: fullBusiness.business.target_keywords || [],
        hasLocalSchema: auditData?.audit.has_local_schema,
        hasRobotsTxt: auditData?.audit.has_robots_txt,
      });

      return res.json(opportunities);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}
