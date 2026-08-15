import type { MetadataRoute } from 'next';
import { ROUTES } from '@/lib/constants/routes';
import { config } from '@/lib/config';

const STATIC_PAGES: {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
}[] = [
  { path: ROUTES.public.home, priority: 1.0, changeFrequency: 'daily' },
  { path: ROUTES.public.courses.root, priority: 0.9, changeFrequency: 'daily' },
  { path: ROUTES.public.instructors.root, priority: 0.7, changeFrequency: 'weekly' },
  { path: ROUTES.public.pricing, priority: 0.8, changeFrequency: 'monthly' },
  { path: ROUTES.public.becomeInstructor.root, priority: 0.6, changeFrequency: 'monthly' },
  { path: ROUTES.public.about, priority: 0.5, changeFrequency: 'monthly' },
  { path: ROUTES.public.faq, priority: 0.5, changeFrequency: 'monthly' },
  { path: ROUTES.public.blog, priority: 0.7, changeFrequency: 'daily' },
  { path: ROUTES.public.careers, priority: 0.4, changeFrequency: 'weekly' },
  { path: ROUTES.public.contact, priority: 0.3, changeFrequency: 'yearly' },
  { path: ROUTES.public.support, priority: 0.3, changeFrequency: 'yearly' },
  // Legal pages: low priority, rarely change, but still indexable — do NOT
  // exclude these from the sitemap just because they're "boring".
  { path: ROUTES.public.privacy, priority: 0.1, changeFrequency: 'yearly' },
  { path: ROUTES.public.terms, priority: 0.1, changeFrequency: 'yearly' },
];

// Next.js will call generateSitemaps() to discover how many sitemap "shards"
// to build, then call the default export once per id. Google fetches
// /sitemap/0.xml, /sitemap/1.xml, etc., plus a /sitemap_index.xml Next.js
// generates automatically. This is the same pattern Amazon/eBay-scale
// catalogs use to stay under the 50,000-URL / 50MB per-file limit.
export async function generateSitemaps() {
  return [{ id: 'static' }, { id: 'courses' }, { id: 'instructors' }, { id: 'blog' }];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  return STATIC_PAGES.map((page) => ({
    url: `${config.siteUrl}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
