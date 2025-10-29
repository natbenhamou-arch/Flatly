import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://skehagxiszijvfndzjtq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrZWhhZ3hpc3ppanZmbmR6anRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2OTI1ODUsImV4cCI6MjA3NzI2ODU4NX0.2SjCDuuaNIGxAGkedPNpLcI79q4b8VSRZT5WjgcKj1w';

console.log('✅ Supabase backend configured:', supabaseUrl);

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
