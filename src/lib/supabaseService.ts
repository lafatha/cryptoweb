import { createClient } from '@supabase/supabase-js';

// Provide default values to prevent build errors when env vars are not set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || 'placeholder-service-role';

// Only log in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Supabase Configuration:');
  console.log('URL:', supabaseUrl);
  console.log('Service Role available:', !!supabaseServiceRole);
  console.log('Service Role first chars:', supabaseServiceRole.substring(0, 20) + '...');
  console.log('Environment check:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('- SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.log('- SUPABASE_SERVICE_ROLE:', !!process.env.SUPABASE_SERVICE_ROLE);
}

export const supabaseService = createClient(
  supabaseUrl,
  supabaseServiceRole,
  { 
    auth: { persistSession: false },
    global: {
      headers: {
        'apikey': supabaseServiceRole,
        'Authorization': `Bearer ${supabaseServiceRole}`
      }
    }
  }
);
