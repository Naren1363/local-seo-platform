import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

let supabaseClient: SupabaseClient | null = null;

if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    console.log('✅ Supabase Client initialized successfully.');
  } catch (error) {
    console.warn('⚠️ Could not initialize Supabase Client, using local fallback DB repository:', error);
  }
} else {
  console.log('ℹ️ SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not configured. Using high-performance local database repository fallback.');
}

export { supabaseClient };

// In-Memory Database Store with schema compatibility
export interface LocalDbStore {
  users: any[];
  businesses: any[];
  business_locations: any[];
  seo_audits: any[];
  seo_issues: any[];
  keywords: any[];
  keyword_results: any[];
  competitors: any[];
  competitor_metrics: any[];
  recommendations: any[];
  reports: any[];
}

export const localDb: LocalDbStore = {
  users: [],
  businesses: [],
  business_locations: [],
  seo_audits: [],
  seo_issues: [],
  keywords: [],
  keyword_results: [],
  competitors: [],
  competitor_metrics: [],
  recommendations: [],
  reports: [],
};
