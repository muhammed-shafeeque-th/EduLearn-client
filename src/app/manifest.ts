import type { MetadataRoute } from 'next';
import { SITE_NAME } from '../lib/constants';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} App`,
    short_name: SITE_NAME,
    description: 'Learn in-demand skills with expert-led online courses.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0f172a',
    icons: [
      {
        src: '/icons/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
