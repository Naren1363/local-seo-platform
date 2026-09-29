import { RecommendationRepository, RecommendationRecord } from '../repositories/recommendationRepository.js';
import { SeoAuditRecord, SeoIssueRecord } from '../repositories/auditRepository.js';
import { FullCompetitor } from '../repositories/competitorRepository.js';

export class RecommendationEngine {
  static async generateRecommendations(params: {
    businessId: string;
    businessName: string;
    city: string;
    auditData?: { audit: SeoAuditRecord; issues: SeoIssueRecord[] } | null;
    competitors?: FullCompetitor[];
  }): Promise<RecommendationRecord[]> {
    const recsToSave: Omit<RecommendationRecord, 'id' | 'created_at'>[] = [];

    // 1. Process Audit Issues into Categorized Recommendations
    if (params.auditData?.issues) {
      for (const issue of params.auditData.issues) {
        recsToSave.push({
          business_id: params.businessId,
          severity: issue.severity,
          category: issue.category as any,
          title: issue.title,
          issue_summary: issue.description,
          impact_explanation: issue.impact_explanation,
          action_steps: [
            `Audit check "${issue.title}" failed during automated crawl.`,
            `Review your CMS / website header files.`,
            issue.recommendation,
          ],
          code_example: issue.code_snippet,
          status: 'open',
        });
      }
    }

    // 2. Process Competitor Gaps
    if (params.competitors && params.competitors.length > 0) {
      const avgCompRating =
        params.competitors.reduce((acc, c) => acc + (c.metrics.rating || 0), 0) / params.competitors.length;

      if (avgCompRating > 4.4) {
        recsToSave.push({
          business_id: params.businessId,
          severity: 'High',
          category: 'Competitor Gap',
          title: 'Competitors Have Higher Average Ratings',
          issue_summary: `Your tracked competitors in ${params.city} have an average rating of ${avgCompRating.toFixed(1)}/5 stars.`,
          impact_explanation: 'Google Map Pack rankings heavily favor businesses with a high volume of positive 5-star customer reviews.',
          action_steps: [
            'Setup automated review request emails/SMS after purchases.',
            'Display a QR code link to your Google Business Profile at check-out.',
            'Respond to 100% of reviews within 24 hours.',
          ],
          code_example: `<a href="https://g.page/r/YOUR_GOOGLE_REVIEW_LINK/review" class="btn">Leave Us a Google Review ⭐⭐⭐⭐⭐</a>`,
          status: 'open',
        });
      }

      const competitorWithoutSchema = params.competitors.filter(c => !c.metrics.local_schema_present);
      if (competitorWithoutSchema.length > 0) {
        recsToSave.push({
          business_id: params.businessId,
          severity: 'Medium',
          category: 'Local',
          title: 'Gain Schema Markup Advantage Over Local Competitors',
          issue_summary: `${competitorWithoutSchema.length} of your competitors lack structured LocalBusiness schema data.`,
          impact_explanation: 'Implementing rich schema will give your website higher click-through rates with star ratings, opening hours, and address badges in search results.',
          action_steps: [
            'Add Schema.org JSON-LD to your website homepage.',
            'Validate using Google Rich Results Test tool.',
          ],
          code_example: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "LocalBusiness",\n  "name": "${params.businessName}",\n  "address": "${params.city}"\n}\n</script>`,
          status: 'open',
        });
      }
    }

    // Save batch to database repository
    const saved = await RecommendationRepository.saveBatch(recsToSave);
    return saved;
  }

  static async getRecommendations(businessId: string): Promise<RecommendationRecord[]> {
    return RecommendationRepository.findByBusinessId(businessId);
  }

  static async updateStatus(id: string, status: RecommendationRecord['status']): Promise<boolean> {
    return RecommendationRepository.updateStatus(id, status);
  }
}
