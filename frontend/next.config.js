// Next.js configuration enabling app directory
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Enable CSS modules
  cssModules: true,
  
  // Enable image optimization
  images: {
    domains: ['localhost'],
  },
  
  // API rewrite configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://web:8000'}/:path*`,
      },
    ];
  },

  // Configure webpack
  webpack(config) {
    return config;
  },
};

module.exports = nextConfig;
