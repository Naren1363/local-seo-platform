import { supabaseClient, localDb } from './db.js';
import { cryptoUtils } from '../utils/cryptoUtils.js';

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

export class RecommendationRepository {
  static async saveBatch(
    recs: Omit<RecommendationRecord, 'id' | 'created_at'>[]
  ): Promise<RecommendationRecord[]> {
    const now = new Date().toISOString();
    const records: RecommendationRecord[] = recs.map(r => ({
      ...r,
      id: cryptoUtils.generateUuid(),
      created_at: now,
    }));

    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from('recommendations')
        .insert(records)
        .select();
      if (error) throw new Error(`Recommendations save error: ${error.message}`);
      return data as RecommendationRecord[];
    }

    localDb.recommendations.push(...records);
    return records;
  }

  static async findByBusinessId(businessId: string): Promise<RecommendationRecord[]> {
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from('recommendations')
        .select('*')
        .eq('business_id', businessId)
        .order('severity', { ascending: true });

      if (error || !data) return [];
      return data as RecommendationRecord[];
    }

    return localDb.recommendations.filter(r => r.business_id === businessId);
  }

  static async updateStatus(id: string, status: RecommendationRecord['status']): Promise<boolean> {
    if (supabaseClient) {
      const { error } = await supabaseClient
        .from('recommendations')
        .update({ status })
        .eq('id', id);
      return !error;
    }

    const rec = localDb.recommendations.find(r => r.id === id);
    if (rec) {
      rec.status = status;
      return true;
    }
    return false;
  }
}
