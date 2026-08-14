/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Placeholder data-access layer. Swap each function body for your real
 * Prisma/Drizzle/CMS query. Signatures are what the sitemap and example
 * pages expect — keep them stable if you rename things.
 */

export async function getAllCourseSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  throw new Error('TODO: wire up to your courses table/CMS');
}

export async function getCourseBySlug(slug: string) {
  throw new Error('TODO: wire up to your courses table/CMS');
}

export async function searchCourses(params: { category?: string; page?: string; search?: string }) {
  throw new Error('TODO: wire up to your courses table/CMS');
}

export async function getAllInstructorIds(): Promise<{ id: string; updatedAt: Date }[]> {
  throw new Error('TODO: wire up to your instructors table');
}

export async function getInstructorById(id: string) {
  throw new Error('TODO: wire up to your instructors table');
}

export async function getAllBlogSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  throw new Error('TODO: wire up to your blog CMS');
}

export async function getBlogPostBySlug(slug: string) {
  throw new Error('TODO: wire up to your blog CMS');
}
