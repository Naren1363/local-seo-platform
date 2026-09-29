export interface User {
  id: string;
  email: string;
  full_name: string;
  company_name?: string;
  role?: string;
}

export interface Business {
  id: string;
  user_id: string;
  name: string;
  website_url: string;
  category: string;
  target_keywords: string[];
  is_active?: boolean;
  created_at?: string;
}

export interface BusinessLocation {
  id: string;
  business_id: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code?: string;
  latitude: number;
  longitude: number;
  formatted_address?: string;
  place_id?: string;
}

export interface FullBusiness {
  business: Business;
  location: BusinessLocation;
}

export interface NearbyPlace {
  id: string;
  name: string;
  category: string;
  business_type: 'direct_competitor' | 'related_business' | 'nearby_business';
  distance_km: number;
  address: string;
  latitude: number;
  longitude: number;
  rating?: number;
  review_count?: number;
  website_url?: string;
  place_id?: string;
}

export interface CompetitorRecord {
  id: string;
  business_id: string;
  name: string;
  category: string;
  website_url?: string;
  address?: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  is_direct_competitor: boolean;
}

export interface CompetitorMetricRecord {
  id: string;
  competitor_id: string;
  rating?: number;
  review_count?: number;
  has_website: boolean;
  has_https: boolean;
  local_schema_present: boolean;
  estimated_seo_score: number;
  keyword_overlap_score: number;
}

export interface FullCompetitor {
  competitor: CompetitorRecord;
  metrics: CompetitorMetricRecord;
}

export interface SeoAuditRecord {
  id: string;
  business_id: string;
  website_url: string;
  overall_score: number;
  technical_score: number;
  onpage_score: number;
  local_score: number;
  response_time_ms?: number;
  is_https: boolean;
  has_robots_txt: boolean;
  has_sitemap: boolean;
  has_canonical: boolean;
  has_local_schema: boolean;
  raw_audit_data?: any;
  created_at?: string;
}

export interface SeoIssueRecord {
  id: string;
  audit_id: string;
  business_id: string;
  category: 'Technical' | 'On-Page' | 'Local';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  impact_explanation: string;
  recommendation: string;
  code_snippet?: string;
  is_resolved?: boolean;
}

export interface AuditAnalysisResult {
  audit: SeoAuditRecord;
  issues: SeoIssueRecord[];
}

export interface KeywordRecord {
  id: string;
  business_id: string;
  keyword: string;
  search_intent: string;
  is_primary?: boolean;
}

export interface KeywordResultRecord {
  id: string;
  keyword_id: string;
  business_id: string;
  local_relevance_score: number;
  competition_level: 'Low' | 'Medium' | 'High';
  estimated_volume: number;
  visibility_score: number;
  serp_features?: any;
  related_queries?: string[];
}

export interface FullKeywordData {
  keyword: KeywordRecord;
  result: KeywordResultRecord;
}

export interface RecommendationRecord {
  id: string;
  business_id: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  category: 'Technical' | 'On-Page' | 'Local' | 'Competitor Gap';
  title: string;
  issue_summary: string;
  impact_explanation: string;
  action_steps: string[];
  code_example?: string;
  status: 'open' | 'in_progress' | 'completed' | 'ignored';
  created_at?: string;
}

export interface LocalOpportunity {
  id: string;
  title: string;
  type: 'Keyword Gap' | 'Location Page' | 'Schema Gap' | 'Competitor Gap' | 'Local Partnership';
  estimated_impact: 'High' | 'Medium' | 'Low';
  description: string;
  actionable_insight: string;
  target_entity?: string;
}

export interface ReportRecord {
  id: string;
  business_id: string;
  title: string;
  summary: string;
  overall_score: number;
  report_data: any;
  created_at?: string;
}
