import { createClient } from '@supabase/supabase-js';

// Provide default values to prevent build errors when env vars are not set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE || 'placeholder-service-role';

export const supabaseService = createClient(
  supabaseUrl,
  supabaseServiceRole,
  { auth: { persistSession: false } }
);
