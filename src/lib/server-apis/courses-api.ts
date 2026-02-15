'use server';

import { fetchApi, FetchOptions } from './server-apis';
import { Course } from '@/types/course';

export interface CourseParams {
  page?: string;
  pageSize?: string;
  search?: string;
  categories?: string;
  rating?: string;
  level?: string;
  priceMin?: string;
  priceMax?: string;
  free?: string;
  paid?: string;
  sortBy?: string;
}

export async function fetchServerCourseBySlug(slug: string, options?: FetchOptions) {
  try {
    const courseRes = await fetchApi<Course>(`courses/slug/${slug}`, options);

    if (!courseRes.success) {
      throw new Error(courseRes.message);
    }
    return {
      course: courseRes.data,
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      course: null,
      success: false,
    };
  }
}

export async function fetchServerCourseById(id: string, options?: FetchOptions) {
  try {
    const courseRes = await fetchApi<Course>(`courses/${id}`, options);

    if (!courseRes.success) {
      throw new Error(courseRes.message);
    }
    return {
      course: courseRes.data,
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      course: null,
      success: false,
    };
  }
}

export async function fetchServerCourses(params: Partial<CourseParams>, options?: FetchOptions) {
  try {
    const searchParams = new URLSearchParams();

    // Pagination
    if (params.page !== undefined) {
      searchParams.set('page', params.page.toString());
    } else {
      searchParams.set('page', '1');
    }
    if (params.pageSize !== undefined) {
      searchParams.set('pageSize', params.pageSize.toString());
    } else {
      searchParams.set('pageSize', '50');
    }

    // if (params.search) {
    //   searchParams.set('search', params.search);
    // }
    // if (params.categories) {
    //   if (Array.isArray(params.categories)) {
    //     params.categories.forEach(cat => {
    //       searchParams.append('categories', cat);
    //     });
    //   } else {
    //     searchParams.set('categories', params.categories);
    //   }
    // }
    // if (params.topics) {
    //   if (Array.isArray(params.topics)) {
    //     params.topics.forEach(topic => {
    //       searchParams.append('topics', topic);
    //     });
    //   } else {
    //     searchParams.set('topics', params.topics);
    //   }
    // }
    // if (params.level) {
    //   searchParams.set('level', params.level);
    // }
    // if (params.rating) {
    //   searchParams.set('rating', params.rating.toString());
    // }
    // if (params.priceMin !== undefined) {
    //   searchParams.set('priceMin', params.priceMin.toString());
    // }
    // if (params.priceMax !== undefined) {
    //   searchParams.set('priceMax', params.priceMax.toString());
    // }
    // if (params.sortBy) {
    //   searchParams.set('sortBy', params.sortBy);
    // }

    const queryString = searchParams.toString();
    const endpoint = `courses?${queryString}`;

    const coursesResponse = await fetchApi<Course[]>(endpoint, options);

    if (!coursesResponse.success) {
      throw new Error(coursesResponse.message);
    }

    // Return a rich result including pagination info and full course objects.
    return {
      courses: coursesResponse.data || [],
      total: coursesResponse.pagination?.total ?? (coursesResponse.data?.length || 0),
      page: params.page ? Number(params.page) : 1,
      totalPages: coursesResponse.pagination?.totalPages ?? 1,
      pageSize: params.pageSize ? Number(params.pageSize) : 50,
    };
  } catch (error) {
    console.error('fetchServerCourses error:', error);
    return {
      courses: [],
      total: 0,
      page: params.page ? Number(params.page) : 1,
      totalPages: 1,
      pageSize: params.pageSize ? Number(params.pageSize) : 50,
    };
  }
}
