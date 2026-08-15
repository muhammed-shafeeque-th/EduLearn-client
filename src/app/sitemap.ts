import type { MetadataRoute } from 'next';
import { config } from '../lib/config';
import { ROUTES } from '../lib/constants/routes';
import { getAllBlogSlugs, getAllCourseSlugs, getAllInstructorIds } from '@/lib/seo/seo-sources';

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

  { path: ROUTES.public.privacy, priority: 0.1, changeFrequency: 'yearly' },
  { path: ROUTES.public.terms, priority: 0.1, changeFrequency: 'yearly' },
];

export async function generateSitemaps() {
  return [{ id: 'static' }, { id: 'courses' }, { id: 'instructors' }, { id: 'blog' }];
}

export default async function sitemap({ id }: { id: string }): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  switch (id) {
    case 'static':
      return STATIC_PAGES.map((page) => ({
        url: `${config.siteUrl}${page.path}`,
        lastModified: now,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      }));

    case 'courses': {
      const courses = await getAllCourseSlugs(); // [{ slug, updatedAt }]
      return courses.map((course) => ({
        url: `${config.siteUrl}${ROUTES.public.courses.course(course.slug)}`,
        lastModified: course.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }

    case 'instructors': {
      const instructors = await getAllInstructorIds(); // [{ id, updatedAt }]
      return instructors.map((instructor) => ({
        url: `${config.siteUrl}${ROUTES.public.instructors.profile(instructor.id)}`,
        lastModified: instructor.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.6,
      }));
    }

    case 'blog': {
      const posts = await getAllBlogSlugs(); // [{ slug, updatedAt }]
      return posts.map((post) => ({
        url: `${config.siteUrl}${ROUTES.public.blogPost(post.slug)}`,
        lastModified: post.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.6,
      }));
    }

    default:
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
}
