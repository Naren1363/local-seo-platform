import { ReportRepository, ReportRecord } from '../repositories/reportRepository.js';
import { BusinessRepository } from '../repositories/businessRepository.js';
import { AuditRepository } from '../repositories/auditRepository.js';
import { CompetitorRepository } from '../repositories/competitorRepository.js';
import { KeywordRepository } from '../repositories/keywordRepository.js';
import { RecommendationRepository } from '../repositories/recommendationRepository.js';

export class ReportService {
  static async generateReport(businessId: string): Promise<ReportRecord> {
    const fullBusiness = await BusinessRepository.findById(businessId);
    if (!fullBusiness) {
      throw new Error('Business record not found.');
    }

    const auditData = await AuditRepository.getLatestAuditByBusinessId(businessId);
    const competitors = await CompetitorRepository.findByBusinessId(businessId);
    const keywords = await KeywordRepository.findByBusinessId(businessId);
    const recommendations = await RecommendationRepository.findByBusinessId(businessId);

    const overallScore = auditData ? auditData.audit.overall_score : 70;
    const businessName = fullBusiness.business.name;
    const city = fullBusiness.location.city;

    const reportPayload = {
      generatedAt: new Date().toISOString(),
      business: fullBusiness.business,
      location: fullBusiness.location,
      scores: {
        overall: overallScore,
        technical: auditData ? auditData.audit.technical_score : 75,
        onpage: auditData ? auditData.audit.onpage_score : 70,
        local: auditData ? auditData.audit.local_score : 65,
      },
      auditSummary: auditData
        ? {
            isHttps: auditData.audit.is_https,
            hasRobotsTxt: auditData.audit.has_robots_txt,
            hasSitemap: auditData.audit.has_sitemap,
            hasCanonical: auditData.audit.has_canonical,
            hasLocalSchema: auditData.audit.has_local_schema,
            issuesCount: auditData.issues.length,
            issues: auditData.issues,
          }
        : null,
      competitorsCount: competitors.length,
      competitors: competitors.map(c => ({
        name: c.competitor.name,
        category: c.competitor.category,
        distance_km: c.competitor.distance_km,
        rating: c.metrics.rating,
        review_count: c.metrics.review_count,
        has_website: c.metrics.has_website,
        has_https: c.metrics.has_https,
        local_schema_present: c.metrics.local_schema_present,
      })),
      keywordsCount: keywords.length,
      keywords: keywords.map(k => ({
        keyword: k.keyword.keyword,
        intent: k.keyword.search_intent,
        relevance: k.result.local_relevance_score,
        competition: k.result.competition_level,
        volume: k.result.estimated_volume,
        visibility: k.result.visibility_score,
      })),
      topRecommendations: recommendations.slice(0, 6),
    };

    const report = await ReportRepository.create({
      business_id: businessId,
      title: `Local SEO Audit & Intelligence Report - ${businessName} (${city})`,
      summary: `Comprehensive local search visibility performance analysis for ${businessName} in ${city}. Overall SEO Score: ${overallScore}/100. Identified ${recommendations.length} actionable improvements and analyzed ${competitors.length} nearby competitors.`,
      overall_score: overallScore,
      report_data: reportPayload,
    });

    return report;
  }

  static async getBusinessReports(businessId: string): Promise<ReportRecord[]> {
    return ReportRepository.findByBusinessId(businessId);
  }

  static async getReportById(id: string): Promise<ReportRecord | null> {
    return ReportRepository.findById(id);
  }
}
