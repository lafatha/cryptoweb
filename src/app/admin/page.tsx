'use client';

import React, { memo, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Memoisasi komponen untuk mencegah re-render yang tidak perlu
const AdminHome: React.FC = memo(() => {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Optimisasi dengan useCallback untuk mencegah re-render
  const handleLogout = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      router.replace('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.replace('/admin/login');
    }
  }, [router]);

  // Optimisasi fetch dengan caching dan error handling yang lebih baik
  const fetchArticles = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased timeout to 15 seconds
      
      const response = await fetch('/api/admin/articles', {
        credentials: 'include',
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 401) {
          router.replace('/admin/login');
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setItems(result.articles || []);
      setErrorMsg(null);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setErrorMsg('Request timeout. Please check your connection and refresh the page.');
      } else if (error.message.includes('fetch')) {
        setErrorMsg('Connection interrupted. Please check your internet connection.');
      } else {
        setErrorMsg(error?.message || 'Failed to fetch articles');
      }
      console.error('Error fetching articles:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Optimisasi delete dengan optimistic updates
  const handleDelete = useCallback(async (id: string) => {
    if (deleting) return; // Prevent multiple deletes
    
    try {
      setDeleting(id);
      
      // Optimistic update - remove from UI immediately
      const originalItems = items;
      setItems(prevItems => prevItems.filter(item => item.id !== id));
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased timeout
      
      const response = await fetch(`/api/admin/articles/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // Revert optimistic update on error
        setItems(originalItems);
        if (response.status === 401) {
          router.replace('/admin/login');
          return;
        }
        throw new Error(`Failed to delete article: ${response.statusText}`);
      }
      
      // Success - no need to refetch, already updated optimistically
      setErrorMsg(null);
      
    } catch (error: any) {
      console.error('Error deleting article:', error);
      if (error.name === 'AbortError') {
        setErrorMsg('Delete timeout. Please check your connection and try again.');
      } else if (error.message.includes('fetch')) {
        setErrorMsg('Connection interrupted while deleting. Please try again.');
      } else {
        setErrorMsg('Failed to delete article');
      }
      // Refetch on error to get current state
      fetchArticles(false);
    } finally {
      setDeleting(null);
    }
  }, [items, deleting, fetchArticles, router]);

  // Memoisasi komponen artikel untuk performa lebih baik
  const ArticleItem = memo(({ article, index }: { article: any; index: number }) => (
    <motion.div 
      key={article.id}
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.05, // Reduced delay for faster rendering
        ease: "easeOut",
        layout: { duration: 0.2 }
      }}
      whileHover={{ 
        scale: 1.005, // Reduced scale for smoother animation
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        transition: { duration: 0.15 }
      }}
      className="p-6 hover:bg-white/5 transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-white truncate">
              {article.title}
            </h3>
            <span 
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                article.is_published 
                  ? 'bg-green-400/20 text-green-300 border border-green-400/30' 
                  : 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30'
              }`}
            >
              {article.is_published ? (
                <>
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Published
                </>
              ) : (
                <>
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Draft
                </>
              )}
            </span>
          </div>
          <div className="flex items-center text-sm text-cyan-100/70 space-x-4">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {article.published_at ? new Date(article.published_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'Not published'}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Link 
              href={`/admin/articles/${article.id}/edit`}
              className="inline-flex items-center p-2 text-cyan-200 hover:text-white hover:bg-blue-500/30 rounded-lg transition-all duration-200 backdrop-blur-sm"
              title="Edit article"
              prefetch={false} // Disable prefetching for better performance
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Link 
              href={`/news/${article.slug}`}
              target="_blank"
              className="inline-flex items-center p-2 text-cyan-200 hover:text-white hover:bg-green-500/30 rounded-lg transition-all duration-200 backdrop-blur-sm"
              title="View article"
              prefetch={false}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </Link>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleDelete(article.id)}
            disabled={deleting === article.id}
            className="inline-flex items-center p-2 text-red-300 hover:text-white hover:bg-red-500/30 rounded-lg transition-all duration-200 backdrop-blur-sm disabled:opacity-50"
            title="Delete article"
          >
            {deleting === article.id ? (
              <div className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  ));

  // Memoize the articles list untuk mencegah re-render yang tidak perlu
  const articlesList = useMemo(() => 
    items.map((article, index) => (
      <ArticleItem key={article.id} article={article} index={index} />
    )), 
    [items, deleting]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 p-6">
      {/* Background ocean effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-400/10 rounded-full blur-2xl animate-ping" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-7xl mx-auto space-y-6"
      >
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/10 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Articles</h2>
                <p className="text-sm text-cyan-100/80">Manage your content articles</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/admin/articles/new"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 shadow-lg"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Tambah Artikel
                </Link>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400/50 shadow-lg"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
                </svg>
                Logout
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Articles List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md rounded-xl shadow-xl border border-white/20"
        >
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/20 text-red-200 p-4 rounded-xl mb-4"
              >
                <div className="font-semibold mb-2">Error:</div>
                <div className="text-sm">{errorMsg}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 text-center"
            >
              <div className="flex items-center justify-center space-x-2">
                <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-cyan-100">Loading articles...</span>
              </div>
            </motion.div>
          ) : items.length === 0 && !errorMsg ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="p-12 text-center"
            >
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-cyan-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No articles yet</h3>
              <p className="text-cyan-100/70">Get started by creating your first article.</p>
            </motion.div>
          ) : (
            <div className="divide-y divide-white/10">
              <AnimatePresence>
                {articlesList}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
});

export default AdminHome;
