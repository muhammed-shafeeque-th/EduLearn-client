import { dehydrate, QueryClient } from '@tanstack/react-query';
import { cache } from 'react';
import { QUERY_KEYS } from './query-keys';
import { CourseFilters } from '@/services/course';
import { Course } from '@/types/course';
import { serverCourseService, serverUserService } from '@/services/server-service-clients';

// Create a server-side query client
export const getServerQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          retry: false,
        },
      },
    })
);

export async function prefetchCurrentUser() {
  const queryClient = getServerQueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.users.current(""),
      queryFn: () => serverUserService.getCurrentUser(),
    });
  } catch (error) {
    console.log('User not authenticated or API error', error);
  }

  return queryClient;
}

export async function prefetchCourses(filters: Partial<CourseFilters> = {}) {
  const queryClient = getServerQueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.courses.list(filters),
      queryFn: () => serverCourseService.getCourses(filters),
    });
  } catch (error) {
    console.error('Failed to prefetch courses:', error);
  }
  const dehydratedState = dehydrate(queryClient);

  const courses = queryClient.getQueryData(QUERY_KEYS.courses.list(filters));
  // console.log('courses reulst ' + JSON.stringify(courses, null, 2));

  return {
    queryClient,
    courses: (courses as { data: { courses: Course[]; total: number } })?.data?.courses as Course[],
    dehydratedState,
  };
}

export async function prefetchCourse(id: string) {
  const queryClient = getServerQueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.courses.detail(id),
      queryFn: () => serverCourseService.getCourseById(id),
    });
  } catch (error) {
    console.error('Failed to prefetch  course:', error);
  }
  const dehydratedState = dehydrate(queryClient);

  const course = queryClient.getQueryData(QUERY_KEYS.courses.detail(id));

  return { queryClient, course: (course as { data: Course })?.data as Course, dehydratedState };
}

export async function prefetchUser(id: string) {
  const queryClient = getServerQueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.users.detail(id),
      queryFn: () => serverUserService.getUser(id),
    });
  } catch (error) {
    console.error('Failed to prefetch user:', error);
  }

  return queryClient;
}

export async function prefetchFeaturedCourses() {
  const queryClient = getServerQueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.courses.featured(),
      queryFn: () => serverCourseService.getFeaturedCourses(),
    });
  } catch (error) {
    console.error('Failed to prefetch featured courses:', error);
  }

  return queryClient;
}
export async function prefetchCourseBySlug(slug: string) {
  const queryClient = getServerQueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.courses.detail(slug),
      queryFn: () => serverCourseService.getCourseBySlug(slug),
    });
  } catch (error) {
    console.error('Failed to prefetch featured courses:', error);
  }
  const dehydratedState = dehydrate(queryClient);

  const course = queryClient.getQueryData(QUERY_KEYS.courses.detail(slug));

  return { queryClient, course, dehydratedState };
}
