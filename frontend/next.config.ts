import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  skipTrailingSlashRedirect: true,
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '2000', pathname: '/media/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '2000', pathname: '/media/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
    ],
  },
};

export default nextConfig;
