import type { MetadataRoute } from 'next';
import { config } from '@/lib/config';
import { ROUTES } from '@/lib/constants/routes';
import { getAllBlogSlugs } from '@/lib/seo/seo-sources';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllBlogSlugs(); // [{ slug, updatedAt }]
  return posts.map((post) => ({
    url: `${config.siteUrl}${ROUTES.public.blogPost(post.slug)}`,
    lastModified: post.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));
}
