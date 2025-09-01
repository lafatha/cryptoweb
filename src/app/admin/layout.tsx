'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Skip authentication check for login page
    if (pathname === '/admin/login') {
      setIsAuthenticated(true);
      return;
    }

    // Check if user is authenticated by checking JWT cookie
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/verify', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store' // Ensure fresh request
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
            router.replace('/admin/login');
          }
        } else {
          setIsAuthenticated(false);
          router.replace('/admin/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        router.replace('/admin/login');
      }
    };

    // Add small delay to ensure cookie is set after login
    const timeoutId = setTimeout(checkAuth, 100);
    return () => clearTimeout(timeoutId);
  }, [pathname, router]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
            <span className="text-white">Checking authentication...</span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
