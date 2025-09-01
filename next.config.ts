import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'coin-images.coingecko.com',
        port: '',
        pathname: '/coins/images/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400, // 24 hours
  },
  webpack: (config, { isServer }) => {
    // Fix for EventEmitter polyfill issues in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        events: require.resolve('events/'),
        stream: require.resolve('stream-browserify'),
        crypto: require.resolve('crypto-browserify'),
        buffer: require.resolve('buffer'),
      }
    }
    return config
  },
  // Disable strict mode to prevent double mounting issues
  reactStrictMode: false,
};

export default nextConfig;
