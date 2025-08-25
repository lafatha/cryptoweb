-- Run this SQL in your Supabase SQL Editor to create the admin_users table

-- Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows service role to access all data
CREATE POLICY "Service role can access admin_users" ON public.admin_users
  FOR ALL USING (auth.role() = 'service_role');

-- Insert a sample admin user (password: "admin123")
-- You should change this password hash to your own
INSERT INTO public.admin_users (username, password_hash) 
VALUES ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON CONFLICT (username) DO NOTHING;

-- Note: The password hash above is for "admin123"
-- To generate your own hash, you can use the script below in Node.js:
-- 
-- const bcrypt = require('bcryptjs');
-- const password = 'your_password_here';
-- const hash = bcrypt.hashSync(password, 10);
-- console.log(hash);
