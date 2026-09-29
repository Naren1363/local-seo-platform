import { supabaseClient, localDb } from './db.js';
import { cryptoUtils } from '../utils/cryptoUtils.js';

export interface KeywordRecord {
  id: string;
  business_id: string;
  keyword: string;
  search_intent: string;
  is_primary?: boolean;
  created_at?: string;
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
  last_updated?: string;
}

export interface FullKeywordData {
  keyword: KeywordRecord;
  result: KeywordResultRecord;
}

export class KeywordRepository {
  static async saveKeywordWithResult(
    keywordData: Omit<KeywordRecord, 'id' | 'created_at'>,
    resultData: Omit<KeywordResultRecord, 'id' | 'keyword_id' | 'business_id' | 'last_updated'>
  ): Promise<FullKeywordData> {
    const keywordId = cryptoUtils.generateUuid();
    const resultId = cryptoUtils.generateUuid();
    const now = new Date().toISOString();

    const newKeyword: KeywordRecord = {
      ...keywordData,
      id: keywordId,
      created_at: now,
    };

    const newResult: KeywordResultRecord = {
      ...resultData,
      id: resultId,
      keyword_id: keywordId,
      business_id: keywordData.business_id,
      last_updated: now,
    };

    if (supabaseClient) {
      const { data: kData, error: kErr } = await supabaseClient
        .from('keywords')
        .insert(newKeyword)
        .select()
        .single();
      if (kErr) throw new Error(`Keyword insert error: ${kErr.message}`);

      const { data: rData, error: rErr } = await supabaseClient
        .from('keyword_results')
        .insert(newResult)
        .select()
        .single();
      if (rErr) throw new Error(`Keyword result insert error: ${rErr.message}`);

      return { keyword: kData as KeywordRecord, result: rData as KeywordResultRecord };
    }

    localDb.keywords.push(newKeyword);
    localDb.keyword_results.push(newResult);

    return { keyword: newKeyword, result: newResult };
  }

  static async findByBusinessId(businessId: string): Promise<FullKeywordData[]> {
    if (supabaseClient) {
      const { data: keywords, error } = await supabaseClient
        .from('keywords')
        .select('*')
        .eq('business_id', businessId);

      if (error || !keywords) return [];

      const list: FullKeywordData[] = [];
      for (const k of keywords) {
        const { data: res } = await supabaseClient
          .from('keyword_results')
          .select('*')
          .eq('keyword_id', k.id)
          .single();
        if (res) {
          list.push({ keyword: k as KeywordRecord, result: res as KeywordResultRecord });
        }
      }
      return list;
    }

    const businessKeywords = localDb.keywords.filter(k => k.business_id === businessId);
    return businessKeywords.map(k => {
      const res = localDb.keyword_results.find(r => r.keyword_id === k.id)!;
      return { keyword: k, result: res };
    }).filter(item => item.result !== undefined);
  }
}
