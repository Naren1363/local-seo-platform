import { supabaseClient, localDb } from './db.js';
import { cryptoUtils } from '../utils/cryptoUtils.js';

export interface BusinessRecord {
  id: string;
  user_id: string;
  name: string;
  website_url: string;
  category: string;
  target_keywords: string[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BusinessLocationRecord {
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
  created_at?: string;
  updated_at?: string;
}

export interface FullBusiness {
  business: BusinessRecord;
  location: BusinessLocationRecord;
}

export class BusinessRepository {
  static async createBusiness(
    businessData: Omit<BusinessRecord, 'id' | 'created_at' | 'updated_at'>,
    locationData: Omit<BusinessLocationRecord, 'id' | 'business_id' | 'created_at' | 'updated_at'>
  ): Promise<FullBusiness> {
    const businessId = cryptoUtils.generateUuid();
    const locationId = cryptoUtils.generateUuid();
    const now = new Date().toISOString();

    const newBusiness: BusinessRecord = {
      ...businessData,
      id: businessId,
      is_active: true,
      created_at: now,
      updated_at: now,
    };

    const newLocation: BusinessLocationRecord = {
      ...locationData,
      id: locationId,
      business_id: businessId,
      created_at: now,
      updated_at: now,
    };

    if (supabaseClient) {
      const { data: bData, error: bErr } = await supabaseClient
        .from('businesses')
        .insert(newBusiness)
        .select()
        .single();
      if (bErr) throw new Error(`Supabase business insert error: ${bErr.message}`);

      const { data: lData, error: lErr } = await supabaseClient
        .from('business_locations')
        .insert(newLocation)
        .select()
        .single();
      if (lErr) throw new Error(`Supabase location insert error: ${lErr.message}`);

      return { business: bData as BusinessRecord, location: lData as BusinessLocationRecord };
    }

    localDb.businesses.push(newBusiness);
    localDb.business_locations.push(newLocation);

    return { business: newBusiness, location: newLocation };
  }

  static async findByUserId(userId: string): Promise<FullBusiness[]> {
    if (supabaseClient) {
      const { data: businesses, error } = await supabaseClient
        .from('businesses')
        .select('*')
        .eq('user_id', userId);

      if (error || !businesses) return [];

      const results: FullBusiness[] = [];
      for (const b of businesses) {
        const { data: loc } = await supabaseClient
          .from('business_locations')
          .select('*')
          .eq('business_id', b.id)
          .single();
        if (loc) {
          results.push({ business: b as BusinessRecord, location: loc as BusinessLocationRecord });
        }
      }
      return results;
    }

    const userBusinesses = localDb.businesses.filter(b => b.user_id === userId);
    return userBusinesses.map(b => {
      const loc = localDb.business_locations.find(l => l.business_id === b.id)!;
      return { business: b, location: loc };
    }).filter(item => item.location !== undefined);
  }

  static async findById(businessId: string): Promise<FullBusiness | null> {
    if (supabaseClient) {
      const { data: b, error } = await supabaseClient
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (error || !b) return null;

      const { data: loc } = await supabaseClient
        .from('business_locations')
        .select('*')
        .eq('business_id', businessId)
        .single();

      if (!loc) return null;
      return { business: b as BusinessRecord, location: loc as BusinessLocationRecord };
    }

    const b = localDb.businesses.find(item => item.id === businessId);
    if (!b) return null;
    const loc = localDb.business_locations.find(l => l.business_id === businessId);
    if (!loc) return null;

    return { business: b, location: loc };
  }
}
