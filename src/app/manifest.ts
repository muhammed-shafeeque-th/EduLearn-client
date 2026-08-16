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
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
