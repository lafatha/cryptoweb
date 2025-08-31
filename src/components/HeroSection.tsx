'use client';

import HeroChat from '@/components/HeroChat';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 py-16">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-blue-400/20 dark:bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-purple-400/20 dark:bg-purple-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-7xl mx-auto">
        {/* Grid layout untuk desktop, stack untuk mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          
          {/* Bagian teks hero - kiri */}
          <div className="lg:col-span-6 text-center lg:text-left space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black dark:text-white leading-tight">
                AI Powered{' '}
                <span className="text-black dark:text-white">
                  Crypto Portfolio
                </span>{' '}
                Tracker
              </h1>
              
              <p className="text-lg md:text-xl text-black dark:text-white leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Track all your holdings across wallets, exchanges, and manual entries with live data and AI insights.
              </p>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-lg hover:shadow-xl">
                Start Tracking
              </button>
              
              <button className="px-8 py-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-2xl font-medium hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Learn More
              </button>
            </div>

            {/* Feature highlights */}
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Real-time prices</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>AI insights</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span>Multi-wallet support</span>
              </div>
            </div>
          </div>

          {/* Bagian chat demo - kanan */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <HeroChat 
              typingSpeedMs={45}
              stagger={0.6}
              loop={true}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
