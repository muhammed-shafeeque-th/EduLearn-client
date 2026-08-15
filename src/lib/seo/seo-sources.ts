/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Placeholder data-access layer. Swap each function body for your real
 * Prisma/Drizzle/CMS query. Signatures are what the sitemap and example
 * pages expect — keep them stable if you rename things.
 */

import { BLOG_POSTS } from '@/app/(public)/blog/[slug]/_/data/blog-data';
import { fetchServerCourses } from '../server-apis';
import { Course } from '@/types/course';
import { serverInstructorService } from '@/services/server-service-clients';

export async function getAllCourseSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  const { courses } = await fetchServerCourses(
    {},
    {
      next: { revalidate: 600 }, // fetch once every 10 min
    }
  );

  return courses?.slice(0, 50).map((course: Course) => ({
    slug: course.slug.toString(),
    updatedAt: new Date(course.updatedAt),
  }));
}

export async function getCourseBySlug(slug: string) {
  return {};
  throw new Error('TODO: wire up to your courses table/CMS');
}

export async function searchCourses(params: { category?: string; page?: string; search?: string }) {
  return [];
  throw new Error('TODO: wire up to your courses table/CMS');
}

export async function getAllInstructorIds(): Promise<{ id: string; updatedAt: Date }[]> {
  const instructors = await serverInstructorService.getInstructors({ page: 1, pageSize: 50 });
  if (!instructors?.success) return [];

  return instructors.data.map((i) => ({ id: i.id, updatedAt: new Date(i.updatedAt) }));
}

export async function getInstructorById(id: string) {
  return {};
  throw new Error('TODO: wire up to your instructors table');
}

export async function getAllBlogSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  return BLOG_POSTS.map((b) => ({ slug: b.slug, updatedAt: new Date(b.updatedAt ?? Date.now()) }));
}

export async function getBlogPostBySlug(slug: string) {
  return {};
  throw new Error('TODO: wire up to your blog CMS');
}
