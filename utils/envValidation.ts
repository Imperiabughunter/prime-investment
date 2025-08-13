
interface EnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  paymentApiUrl?: string;
  paymentApiKey?: string;
}

export const validateEnvironment = (): EnvConfig => {
  const config = {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://isyrvlartesxfygagbii.supabase.co',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzeXJ2bGFydGVzeGZ5Z2FnYmlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MTAxNTAsImV4cCI6MjA1ODQ4NjE1MH0.8lYQMgJxm_IJzxAgE52luWI-RfhK9Nu5CiQNYR9Paks',
    paymentApiUrl: process.env.EXPO_PUBLIC_PAYMENT_API_URL,
    paymentApiKey: process.env.EXPO_PUBLIC_PAYMENT_API_KEY,
  };

  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error('Missing required Supabase environment variables');
  }

  return config;
};
