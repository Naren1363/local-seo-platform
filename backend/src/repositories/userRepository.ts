import { supabaseClient, localDb } from './db.js';
import { cryptoUtils } from '../utils/cryptoUtils.js';

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  company_name?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export class UserRepository {
  static async findByEmail(email: string): Promise<UserRecord | null> {
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();
      if (error || !data) return null;
      return data as UserRecord;
    }

    const user = localDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  }

  static async findById(id: string): Promise<UserRecord | null> {
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      if (error || !data) return null;
      return data as UserRecord;
    }

    const user = localDb.users.find(u => u.id === id);
    return user || null;
  }

  static async create(user: Omit<UserRecord, 'id' | 'created_at' | 'updated_at'>): Promise<UserRecord> {
    const newUser: UserRecord = {
      id: cryptoUtils.generateUuid(),
      email: user.email.toLowerCase(),
      password_hash: user.password_hash,
      full_name: user.full_name,
      company_name: user.company_name || '',
      role: user.role || 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from('users')
        .insert(newUser)
        .select()
        .single();
      if (error) throw new Error(`Supabase insert user error: ${error.message}`);
      return data as UserRecord;
    }

    localDb.users.push(newUser);
    return newUser;
  }
}
