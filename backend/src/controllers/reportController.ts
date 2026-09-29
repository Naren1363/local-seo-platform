import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { ReportService } from '../services/reportService.js';

export class ReportController {
  static async generateReport(req: AuthenticatedRequest, res: Response) {
    try {
      const { businessId } = req.body;
      if (!businessId) {
        return res.status(400).json({ error: 'businessId is required.' });
      }

      const report = await ReportService.generateReport(businessId);
      return res.status(201).json(report);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getReports(req: AuthenticatedRequest, res: Response) {
    try {
      const { businessId } = req.query;
      if (!businessId) {
        return res.status(400).json({ error: 'businessId is required.' });
      }

      const list = await ReportService.getBusinessReports(businessId as string);
      return res.json(list);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getReportById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const report = await ReportService.getReportById(id);
      if (!report) return res.status(404).json({ error: 'Report not found.' });

      return res.json(report);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}
