import { config } from '@/lib/config';
import type { NextConfig } from 'next';

const isProd = config.environment === 'production';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: isProd || true,
  },
  typescript: {
    ignoreBuildErrors: isProd || true,
  },
  // i18n: isProd
  //   ? {
  //       locales: ['en', 'fr', 'es'],
  //       defaultLocale: 'en',
  //     }
  //   : undefined,

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: 'https', hostname: '**.cloudinary.com' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'media.istockphoto.com' },
      { protocol: 'http', hostname: 'localhost', port: '4000' },
    ],
  },

  experimental: {
    optimizePackageImports: [
      '@heroicons/react',
      'lodash-es',
      '@radix-ui/react-icons',
      'lucide-react',
      'framer-motion',
      'date-fns',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
    ],
  },

  compiler: {
    removeConsole: isProd ? { exclude: ['error', 'warn'] } : false,
  },
};

export default nextConfig;
