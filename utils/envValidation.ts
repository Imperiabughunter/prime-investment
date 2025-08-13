
export interface AppEnvironment {
  EXPO_PUBLIC_SUPABASE_URL: string;
  EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
}

export function validateEnv(): AppEnvironment {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

  if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
    console.warn('EXPO_PUBLIC_SUPABASE_URL not configured, using placeholder');
  }

  if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key') {
    console.warn('EXPO_PUBLIC_SUPABASE_ANON_KEY not configured, using placeholder');
  }

  return {
    EXPO_PUBLIC_SUPABASE_URL: supabaseUrl,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
  };
}
