import { supabaseClient, localDb } from './db.js';
import { cryptoUtils } from '../utils/cryptoUtils.js';

export interface ReportRecord {
  id: string;
  business_id: string;
  title: string;
  summary: string;
  overall_score: number;
  report_data: any;
  created_at?: string;
}

export class ReportRepository {
  static async create(reportData: Omit<ReportRecord, 'id' | 'created_at'>): Promise<ReportRecord> {
    const report: ReportRecord = {
      ...reportData,
      id: cryptoUtils.generateUuid(),
      created_at: new Date().toISOString(),
    };

    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from('reports')
        .insert(report)
        .select()
        .single();
      if (error) throw new Error(`Report create error: ${error.message}`);
      return data as ReportRecord;
    }

    localDb.reports.push(report);
    return report;
  }

  static async findByBusinessId(businessId: string): Promise<ReportRecord[]> {
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from('reports')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data as ReportRecord[];
    }

    return localDb.reports
      .filter(r => r.business_id === businessId)
      .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
  }

  static async findById(id: string): Promise<ReportRecord | null> {
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from('reports')
        .select('*')
        .eq('id', id)
        .single();
      if (error || !data) return null;
      return data as ReportRecord;
    }

    return localDb.reports.find(r => r.id === id) || null;
  }
}
