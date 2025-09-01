'use client';


import HeroChat from '@/components/HeroChat';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen bg-white dark:bg-black flex items-center justify-center px-4 py-24">
      {/* Minimal grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(0,0,0,0.03)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgb(255,255,255,0.03)_1px,transparent_0)] bg-[size:24px_24px]" />

      <div className="relative w-full max-w-7xl mx-auto">
        {/* Grid layout for desktop, stack for mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          
          {/* Hero text section - left */}
          <div className="lg:col-span-6 text-center lg:text-left space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-black dark:text-white leading-[0.9] tracking-tight">
                AI Powered
                <br />
                Crypto Portfolio
                <br />
                Tracker
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light">
                Track all your holdings across wallets, exchanges, and manual entries with live data and AI insights.
              </p>
            </div>

            {/* CTA buttons */}
            <div className="flex justify-center lg:justify-start">
              <button 
                onClick={() => window.location.href = '/portfolio'}
                className="w-full sm:w-auto px-12 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                Get Started
              </button>
            </div>


          </div>

          {/* Chat demo section - right */}
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
