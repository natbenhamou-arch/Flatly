import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder-key') {
  console.warn('⚠️ Supabase is not configured. Using placeholder values.');
  console.warn('To configure Supabase:');
  console.warn('1. Create a project at https://supabase.com');
  console.warn('2. Add your credentials to app.json in the "extra" section:');
  console.warn('   "extra": {');
  console.warn('     "supabaseUrl": "YOUR_SUPABASE_URL",');
  console.warn('     "supabaseAnonKey": "YOUR_SUPABASE_ANON_KEY"');
  console.warn('   }');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
