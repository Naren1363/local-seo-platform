import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { AuthController } from '../controllers/authController.js';
import { BusinessController } from '../controllers/businessController.js';
import { NearbyController } from '../controllers/nearbyController.js';
import { CompetitorController } from '../controllers/competitorController.js';
import { AuditController } from '../controllers/auditController.js';
import { KeywordController } from '../controllers/keywordController.js';
import { RecommendationController } from '../controllers/recommendationController.js';
import { OpportunityController } from '../controllers/opportunityController.js';
import { ReportController } from '../controllers/reportController.js';

const router = Router();

// Auth Routes
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.get('/auth/me', authenticateToken as any, AuthController.me);

// Business Routes
router.post('/business', authenticateToken as any, BusinessController.createBusiness);
router.get('/business', authenticateToken as any, BusinessController.getUserBusinesses);
router.get('/business/:id', authenticateToken as any, BusinessController.getBusinessById);

// Nearby Places & Local Intelligence Routes
router.get('/nearby', authenticateToken as any, NearbyController.getNearbyPlaces);

// Competitor Intelligence Routes
router.post('/competitors', authenticateToken as any, CompetitorController.addCompetitor);
router.get('/competitors', authenticateToken as any, CompetitorController.getCompetitors);
router.delete('/competitors/:id', authenticateToken as any, CompetitorController.deleteCompetitor);

// SEO Audit Routes
router.post('/audit/run', authenticateToken as any, AuditController.runAudit);
router.get('/audit/latest', authenticateToken as any, AuditController.getLatestAudit);

// Keyword Intelligence Routes
router.post('/keywords/analyze', authenticateToken as any, KeywordController.analyzeKeywords);
router.get('/keywords', authenticateToken as any, KeywordController.getKeywords);

// Recommendation Engine Routes
router.get('/recommendations', authenticateToken as any, RecommendationController.getRecommendations);
router.patch('/recommendations/:id/status', authenticateToken as any, RecommendationController.updateStatus);

// Local Opportunity Routes
router.get('/opportunities', authenticateToken as any, OpportunityController.getOpportunities);

// Report Routes
router.post('/reports/generate', authenticateToken as any, ReportController.generateReport);
router.get('/reports', authenticateToken as any, ReportController.getReports);
router.get('/reports/:id', authenticateToken as any, ReportController.getReportById);

export default router;
