/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure Prisma client is generated before build
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Run prisma generate as part of the build
      const { execSync } = require('child_process');
      try {
        execSync('npx prisma generate');
        console.log('Prisma client generated successfully');
      } catch (error) {
        console.error('Error generating Prisma client:', error);
      }
    }
    return config;
  },
  // Disable static optimization for API routes to ensure they're always server-side rendered
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma']
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
