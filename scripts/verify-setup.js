#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Admin Dashboard Setup Verification\n');

// Check if environment file exists
const envFile = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envFile)) {
  console.log('✅ .env.local file found');
  
  // Check environment variables
  const envContent = fs.readFileSync(envFile, 'utf-8');
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE',
    'ADMIN_JWT_SECRET',
    'NEXT_PUBLIC_SITE_URL'
  ];
  
  const missingVars = requiredVars.filter(varName => !envContent.includes(varName));
  
  if (missingVars.length === 0) {
    console.log('✅ All required environment variables are present');
  } else {
    console.log('❌ Missing environment variables:');
    missingVars.forEach(varName => console.log(`   - ${varName}`));
  }
} else {
  console.log('❌ .env.local file not found');
  console.log('   Please copy .env.example to .env.local and fill in the values');
}

// Check if admin files exist
const adminFiles = [
  'src/lib/supabaseService.ts',
  'src/lib/jwt.ts',
  'src/lib/data/articles.ts',
  'middleware.ts',
  'src/app/admin/login/page.tsx',
  'src/app/admin/layout.tsx',
  'src/app/admin/page.tsx',
  'src/app/api/admin/login/route.ts',
  'src/app/api/admin/logout/route.ts'
];

console.log('\n📁 Checking admin files:');
adminFiles.forEach(filePath => {
  if (fs.existsSync(path.join(process.cwd(), filePath))) {
    console.log(`✅ ${filePath}`);
  } else {
    console.log(`❌ ${filePath}`);
  }
});

// Check dependencies
console.log('\n📦 Checking dependencies:');
const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'));
const requiredDeps = ['jose', 'bcryptjs', '@supabase/supabase-js'];

requiredDeps.forEach(dep => {
  if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
    console.log(`✅ ${dep}`);
  } else {
    console.log(`❌ ${dep} - run: npm install ${dep}`);
  }
});

console.log('\n🎯 Next Steps:');
console.log('1. Set up your .env.local file with the required variables');
console.log('2. Run the SQL script in scripts/setup-admin.sql in your Supabase SQL Editor');
console.log('3. Create an admin user with: npm run admin:hash');
console.log('4. Start the development server: npm run dev');
console.log('5. Access the admin at: http://localhost:3000/admin/login');

console.log('\n📖 For detailed instructions, see ADMIN_SETUP.md');
