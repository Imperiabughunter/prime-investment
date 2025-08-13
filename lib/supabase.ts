
import { createClient } from '@supabase/supabase-js';
import { validateEnv } from '../utils/envValidation';

// Validate environment variables
const env = validateEnv();

export const supabase = createClient(
  env.EXPO_PUBLIC_SUPABASE_URL,
  env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'prime-investment-app',
      },
    },
    db: {
      schema: 'public',
    },
  }
);

// Enhanced error handling for Supabase operations
export const handleSupabaseError = (error: any, operation: string) => {
  console.error(`Supabase ${operation} error:`, error);
  
  if (error?.code === 'PGRST301') {
    throw new Error('Resource not found');
  }
  
  if (error?.code === '23505') {
    throw new Error('This record already exists');
  }
  
  if (error?.message?.includes('JWT')) {
    throw new Error('Session expired. Please sign in again.');
  }
  
  throw new Error(error?.message || `Failed to ${operation}`);
};

// Database schema types for better type safety
export interface DbUser {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface DbInvestment {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  start_date: string;
  end_date: string;
  status: string;
  expected_return: number;
  created_at: string;
}

export interface DbTransaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  created_at: string;
  meta?: any;
}

export interface DbLoan {
  id: string;
  user_id: string;
  amount: number;
  term_months: number;
  interest_rate: number;
  status: string;
  created_at: string;
  approved_at?: string;
}
