import { supabaseClient, localDb } from './db.js';
import { cryptoUtils } from '../utils/cryptoUtils.js';

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
  created_at?: string;
}

export class AuditRepository {
  static async saveAudit(
    auditData: Omit<SeoAuditRecord, 'id' | 'created_at'>,
    issues: Omit<SeoIssueRecord, 'id' | 'audit_id' | 'business_id' | 'created_at'>[]
  ): Promise<{ audit: SeoAuditRecord; issues: SeoIssueRecord[] }> {
    const auditId = cryptoUtils.generateUuid();
    const now = new Date().toISOString();

    const audit: SeoAuditRecord = {
      ...auditData,
      id: auditId,
      created_at: now,
    };

    const savedIssues: SeoIssueRecord[] = issues.map(iss => ({
      ...iss,
      id: cryptoUtils.generateUuid(),
      audit_id: auditId,
      business_id: auditData.business_id,
      is_resolved: false,
      created_at: now,
    }));

    if (supabaseClient) {
      const { data: aData, error: aErr } = await supabaseClient
        .from('seo_audits')
        .insert(audit)
        .select()
        .single();
      if (aErr) throw new Error(`Audit insert error: ${aErr.message}`);

      if (savedIssues.length > 0) {
        const { error: iErr } = await supabaseClient
          .from('seo_issues')
          .insert(savedIssues);
        if (iErr) throw new Error(`Issues insert error: ${iErr.message}`);
      }

      return { audit: aData as SeoAuditRecord, issues: savedIssues };
    }

    localDb.seo_audits.push(audit);
    localDb.seo_issues.push(...savedIssues);

    return { audit, issues: savedIssues };
  }

  static async getLatestAuditByBusinessId(businessId: string): Promise<{ audit: SeoAuditRecord; issues: SeoIssueRecord[] } | null> {
    if (supabaseClient) {
      const { data: audits } = await supabaseClient
        .from('seo_audits')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!audits || audits.length === 0) return null;

      const latestAudit = audits[0] as SeoAuditRecord;
      const { data: issues } = await supabaseClient
        .from('seo_issues')
        .select('*')
        .eq('audit_id', latestAudit.id);

      return { audit: latestAudit, issues: (issues || []) as SeoIssueRecord[] };
    }

    const businessAudits = localDb.seo_audits
      .filter(a => a.business_id === businessId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (businessAudits.length === 0) return null;

    const latestAudit = businessAudits[0];
    const issues = localDb.seo_issues.filter(i => i.audit_id === latestAudit.id);

    return { audit: latestAudit, issues };
  }
}
