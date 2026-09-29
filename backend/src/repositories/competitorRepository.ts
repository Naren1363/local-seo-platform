import { supabaseClient, localDb } from './db.js';
import { cryptoUtils } from '../utils/cryptoUtils.js';

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
  created_at?: string;
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
  last_updated?: string;
}

export interface FullCompetitor {
  competitor: CompetitorRecord;
  metrics: CompetitorMetricRecord;
}

export class CompetitorRepository {
  static async addCompetitor(
    compData: Omit<CompetitorRecord, 'id' | 'created_at'>,
    metricData: Omit<CompetitorMetricRecord, 'id' | 'competitor_id' | 'last_updated'>
  ): Promise<FullCompetitor> {
    const competitorId = cryptoUtils.generateUuid();
    const metricId = cryptoUtils.generateUuid();
    const now = new Date().toISOString();

    const competitor: CompetitorRecord = {
      ...compData,
      id: competitorId,
      created_at: now,
    };

    const metrics: CompetitorMetricRecord = {
      ...metricData,
      id: metricId,
      competitor_id: competitorId,
      last_updated: now,
    };

    if (supabaseClient) {
      const { data: cData, error: cErr } = await supabaseClient
        .from('competitors')
        .insert(competitor)
        .select()
        .single();
      if (cErr) throw new Error(`Competitor insert error: ${cErr.message}`);

      const { data: mData, error: mErr } = await supabaseClient
        .from('competitor_metrics')
        .insert(metrics)
        .select()
        .single();
      if (mErr) throw new Error(`Competitor metrics insert error: ${mErr.message}`);

      return { competitor: cData as CompetitorRecord, metrics: mData as CompetitorMetricRecord };
    }

    localDb.competitors.push(competitor);
    localDb.competitor_metrics.push(metrics);

    return { competitor, metrics };
  }

  static async findByBusinessId(businessId: string): Promise<FullCompetitor[]> {
    if (supabaseClient) {
      const { data: competitors, error } = await supabaseClient
        .from('competitors')
        .select('*')
        .eq('business_id', businessId);

      if (error || !competitors) return [];

      const list: FullCompetitor[] = [];
      for (const c of competitors) {
        const { data: m } = await supabaseClient
          .from('competitor_metrics')
          .select('*')
          .eq('competitor_id', c.id)
          .single();
        if (m) {
          list.push({ competitor: c as CompetitorRecord, metrics: m as CompetitorMetricRecord });
        }
      }
      return list;
    }

    const compList = localDb.competitors.filter(c => c.business_id === businessId);
    return compList.map(c => {
      const m = localDb.competitor_metrics.find(metric => metric.competitor_id === c.id)!;
      return { competitor: c, metrics: m };
    }).filter(item => item.metrics !== undefined);
  }

  static async deleteCompetitor(businessId: string, competitorId: string): Promise<boolean> {
    if (supabaseClient) {
      const { error } = await supabaseClient
        .from('competitors')
        .delete()
        .eq('id', competitorId)
        .eq('business_id', businessId);
      return !error;
    }

    const index = localDb.competitors.findIndex(c => c.id === competitorId && c.business_id === businessId);
    if (index !== -1) {
      localDb.competitors.splice(index, 1);
      localDb.competitor_metrics = localDb.competitor_metrics.filter(m => m.competitor_id !== competitorId);
      return true;
    }
    return false;
  }
}
