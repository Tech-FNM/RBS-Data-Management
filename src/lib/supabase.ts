import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string, fallback: string) => {
  const val = (import.meta as any).env[key];
  if (!val || val === 'undefined' || val === 'null') return fallback;
  return val;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL', 'https://sqdaxwdprjmwuxjfrxzi.supabase.co');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZGF4d2Rwcmptd3V4amZyeHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MDk0MzUsImV4cCI6MjA1NjA4NTQzNX0.j-xJLV0qagmA3Q1SuaKcc6UOdQHdXk8huafIgdLnbIE');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
