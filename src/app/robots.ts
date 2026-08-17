import type { MetadataRoute } from 'next';
import { config } from '../lib/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/admin',
          '/api/',
          '/auth/',
          '/checkout',
          '/*?*sessionid=', // strip tracking/session params from crawl budget
          '/*?*ref=',
        ],
      },
      // Example: block an aggressive scraper bot outright while staying
      // open to real search engines — adjust or remove as needed.
      // { userAgent: 'GPTBot', disallow: '/' },
    ],
    sitemap: [
      `${config.siteUrl}/sitemap/static.xml`,
      `${config.siteUrl}/sitemap/courses.xml`,
      `${config.siteUrl}/sitemap/instructors.xml`,
      `${config.siteUrl}/sitemap/blog.xml`,
    ],
    host: config.siteUrl,
  };
}
