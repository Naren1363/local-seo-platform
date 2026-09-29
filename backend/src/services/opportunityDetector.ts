export interface LocalOpportunity {
  id: string;
  title: string;
  type: 'Keyword Gap' | 'Location Page' | 'Schema Gap' | 'Competitor Gap' | 'Local Partnership';
  estimated_impact: 'High' | 'Medium' | 'Low';
  description: string;
  actionable_insight: string;
  target_entity?: string;
}

export class OpportunityDetector {
  static detectOpportunities(params: {
    businessName: string;
    city: string;
    category: string;
    keywords: string[];
    hasLocalSchema?: boolean;
    hasRobotsTxt?: boolean;
  }): LocalOpportunity[] {
    const opportunities: LocalOpportunity[] = [];

    // 1. Untargeted Local Keyword Gaps
    opportunities.push({
      id: 'opp-1',
      title: `High-Demand Neighborhood Landing Page: ${params.city} Central`,
      type: 'Location Page',
      estimated_impact: 'High',
      description: `Search queries for "${params.category} near ${params.city} center" show high organic search volume with low domain competition.`,
      actionable_insight: `Create a dedicated landing page titled "${params.category} in ${params.city} Center & Surrounding Districts" with local customer testimonials and Google Map embed.`,
      target_entity: `${params.city} Central`,
    });

    // 2. Structured Data Schema Gap
    if (!params.hasLocalSchema) {
      opportunities.push({
        id: 'opp-2',
        title: 'Rich Snippet & Map Pack LocalBusiness Schema Gap',
        type: 'Schema Gap',
        estimated_impact: 'High',
        description: 'Your business website is missing JSON-LD structured data entity tags.',
        actionable_insight: 'Adding LocalBusiness & GeoCoordinates schema enables instant rich snippet rendering and higher Google Maps zero-click conversions.',
        target_entity: 'Schema.org JSON-LD',
      });
    }

    // 3. Local Partnership & Citation Opportunities
    opportunities.push({
      id: 'opp-3',
      title: `Cross-Promotion with Nearby Non-Competing Businesses in ${params.city}`,
      type: 'Local Partnership',
      estimated_impact: 'Medium',
      description: 'Collaborating with nearby complementary local venues (e.g. coffee shops, event halls) provides powerful local backlinks.',
      actionable_insight: 'Reach out to nearby non-competing businesses for co-marketed local guides and reciprocal website links.',
      target_entity: 'Local Chamber of Commerce & Nearby Venues',
    });

    // 4. Service / Category Expansion Opportunity
    opportunities.push({
      id: 'opp-4',
      title: `Expand High-Intent Long-Tail Keyword Targeting`,
      type: 'Keyword Gap',
      estimated_impact: 'Medium',
      description: `Consumers in ${params.city} frequently search for specialized queries like "same day ${params.category} delivery ${params.city}".`,
      actionable_insight: `Build specialized service sub-pages targeting "Same Day Service in ${params.city}" to capture high-conversion transactional traffic.`,
      target_entity: 'Transactional Keywords',
    });

    return opportunities;
  }
}
