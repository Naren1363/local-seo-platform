import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { BusinessService } from '../services/businessService.js';
import { SeoAuditService } from '../services/seoAuditService.js';
import { AuditRepository } from '../repositories/auditRepository.js';

export class AuditController {
  static async runAudit(req: AuthenticatedRequest, res: Response) {
    try {
      const { businessId, websiteUrl } = req.body;
      if (!businessId) {
        return res.status(400).json({ error: 'businessId is required.' });
      }

      const fullBusiness = await BusinessService.getBusinessById(businessId);
      if (!fullBusiness) {
        return res.status(404).json({ error: 'Business not found.' });
      }

      const targetUrl = websiteUrl || fullBusiness.business.website_url;
      if (!targetUrl) {
        return res.status(400).json({ error: 'Website URL is required for audit.' });
      }

      const result = await SeoAuditService.runAudit({
        businessId,
        websiteUrl: targetUrl,
        businessName: fullBusiness.business.name,
        address: fullBusiness.location.address,
        city: fullBusiness.location.city,
        targetKeywords: fullBusiness.business.target_keywords,
      });

      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getLatestAudit(req: AuthenticatedRequest, res: Response) {
    try {
      const { businessId } = req.query;
      if (!businessId) {
        return res.status(400).json({ error: 'businessId is required.' });
      }

      const audit = await AuditRepository.getLatestAuditByBusinessId(businessId as string);
      if (!audit) {
        return res.status(404).json({ error: 'No audit history found for this business.' });
      }

      return res.json(audit);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}
