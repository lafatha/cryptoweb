# Admin Dashboard Setup Guide

This guide will help you set up the admin dashboard for your crypto web application.

## 🚀 Features

- **Secure Authentication**: JWT-based admin authentication with bcrypt password hashing
- **Protected Routes**: Middleware protection for all admin routes
- **CRUD Operations**: Complete article management (Create, Read, Update, Delete)
- **Server-Side Rendering**: Optimized performance with Next.js App Router
- **Responsive Design**: Mobile-friendly admin interface

## 📋 Prerequisites

1. **Supabase Project**: Make sure you have a Supabase project set up
2. **Environment Variables**: Configure your environment variables
3. **Database Tables**: Create the necessary database tables

## 🛠️ Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE`: Your Supabase service role key (keep this secret!)
- `ADMIN_JWT_SECRET`: A long, random secret key for JWT signing
- `NEXT_PUBLIC_SITE_URL`: Your site URL (http://localhost:3000 for development)

### 2. Database Setup

Run the SQL script in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of scripts/setup-admin.sql
```

This will create:
- `admin_users` table with proper RLS policies
- A default admin user (username: `admin`, password: `admin123`)

### 3. Create Your Admin User

#### Option A: Use the provided script
```bash
node scripts/generate-hash.js
```

#### Option B: Manual password hashing
```javascript
const bcrypt = require('bcryptjs');
const password = 'your_secure_password';
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
```

Then insert into Supabase:
```sql
INSERT INTO public.admin_users (username, password_hash) 
VALUES ('your_username', 'your_password_hash');
```

### 4. Start the Development Server

```bash
npm run dev
```

## 🔗 Admin Routes

- **Login**: `/admin/login`
- **Dashboard**: `/admin` (lists all articles)
- **New Article**: `/admin/articles/new`
- **Edit Article**: `/admin/articles/[id]/edit`

## 🔒 Security Features

### Authentication Flow
1. User submits credentials at `/admin/login`
2. Server validates against `admin_users` table using bcrypt
3. JWT token is issued and stored as HttpOnly cookie
4. Middleware protects all `/admin/*` routes except login

### Password Security
- Passwords are hashed using bcrypt with salt rounds of 10
- JWT tokens expire after 7 days
- HttpOnly cookies prevent XSS attacks
- Service role key is used for database operations

### Route Protection
- Middleware automatically redirects unauthenticated users to login
- All admin routes require valid JWT token
- Logout clears the authentication cookie

## 📝 Article Management

### Article Schema
The articles table should have these fields:
- `id` (UUID, primary key)
- `slug` (text, unique)
- `title` (text)
- `excerpt` (text, optional)
- `content` (text)
- `category` (text, default: 'News')
- `is_published` (boolean, default: false)
- `published_at` (timestamp, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Features
- **Auto-slug generation**: Slugs are automatically generated from titles
- **Draft/Publish toggle**: Articles can be saved as drafts or published immediately
- **Rich content**: Full content editing with textarea (can be extended with rich text editor)
- **Category management**: Organize articles by category
- **Live preview**: View published articles directly from admin

## 🚧 Customization

### Styling
The admin interface uses Tailwind CSS. You can customize:
- Colors and themes in `tailwind.config.js`
- Component styles in individual page files
- Layout in `app/admin/layout.tsx`

### Extending Functionality
- Add rich text editor (TinyMCE, Quill, etc.)
- Implement image upload
- Add user roles and permissions
- Create article analytics
- Add bulk operations

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid credentials" error**
   - Check if admin user exists in database
   - Verify password hash is correct
   - Ensure SUPABASE_SERVICE_ROLE is set

2. **Middleware redirect loop**
   - Check ADMIN_JWT_SECRET is set
   - Verify JWT token format
   - Clear browser cookies and try again

3. **Database connection errors**
   - Verify Supabase URL and service role key
   - Check if RLS policies are correctly set
   - Ensure service role has proper permissions

4. **Build errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check for TypeScript errors
   - Verify all environment variables are set

## 📦 Dependencies Used

- `jose`: JWT token handling
- `bcryptjs`: Password hashing
- `@supabase/supabase-js`: Database operations
- `next`: Framework and routing
- `tailwindcss`: Styling

## 🔄 Next Steps

1. **Security**: Change default admin credentials
2. **UI/UX**: Customize the admin interface
3. **Features**: Add more functionality as needed
4. **Deployment**: Set up production environment variables

## 📞 Support

If you encounter any issues:
1. Check this README first
2. Verify your environment variables
3. Check browser console for errors
4. Review Supabase logs for database issues
