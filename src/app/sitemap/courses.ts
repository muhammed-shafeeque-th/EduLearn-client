import type { MetadataRoute } from 'next';
import { getAllCourseSlugs } from '@/lib/seo/seo-sources';
import { config } from '@/lib/config';
import { ROUTES } from '@/lib/constants/routes';
// Replace these with your real data-access calls (DB, CMS, API).

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const courses = await getAllCourseSlugs(); // [{ slug, updatedAt }]
  return courses.map((course) => ({
    url: `${config.siteUrl}${ROUTES.public.courses.course(course.slug)}`,
    lastModified: course.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
}
