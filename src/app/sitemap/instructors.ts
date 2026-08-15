import type { MetadataRoute } from 'next';
import { getAllInstructorIds } from '@/lib/seo/seo-sources';
import { ROUTES } from '@/lib/constants/routes';
import { config } from '@/lib/config';
// Replace these with your real data-access calls (DB, CMS, API).

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const instructors = await getAllInstructorIds(); // [{ id, updatedAt }]
  return instructors.map((instructor) => ({
    url: `${config.siteUrl}${ROUTES.public.instructors.profile(instructor.id)}`,
    lastModified: instructor.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));
}
