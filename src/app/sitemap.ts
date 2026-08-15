import type { MetadataRoute } from 'next';
import { config } from '@/lib/config';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${config.siteUrl}/sitemap/static.xml`,
      lastModified: new Date(),
    },
    {
      url: `${config.siteUrl}/sitemap/courses.xml`,
      lastModified: new Date(),
    },
    {
      url: `${config.siteUrl}/sitemap/instructors.xml`,
      lastModified: new Date(),
    },
    {
      url: `${config.siteUrl}/sitemap/blog.xml`,
      lastModified: new Date(),
    },
  ];
}
