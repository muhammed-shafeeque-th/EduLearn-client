'use server';

import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { Course } from '@/types/course';
import { Instructor } from '@/types/user';
import {
  serverAdminService,
  serverCourseService,
  serverUserService,
} from '@/services/server-service-clients';
import { CourseAnalytics } from '@/services/course.service';

export interface InstructorsStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  newThisMonth: number;
  totalCourses: number;
  newCourses: number;
  averageRating: number;
  ratingChange: number;
}
export interface UsersStats {
  total: number;
  active: number;
  inactive: number;
  blocked: number;
}

export interface CourseStats {
  published: number;
  draft: number;
  totalEnrollments: number;
  activeStudents: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  avgCompletionRate: number;
}

export interface InstructorsFilter {
  search?: string;
  status?: 'active' | 'inactive' | 'pending';
  page?: number;
  limit?: number;
}

export const getInstructorsStats = unstable_cache(
  async (): Promise<InstructorsStats> => {
    try {
      const response = await serverAdminService.getInstructorsStats();

      if (!response || !response.success || !response.data) {
        throw new Error(response.message);
      }

      const stats = response.data;

      return {
        total: typeof stats.total === 'number' ? stats.total : 0,
        active: typeof stats.active === 'number' ? stats.active : 0,
        inactive: typeof stats.inactive === 'number' ? stats.inactive : 0,
        pending: typeof stats.pending === 'number' ? stats.pending : 0,
        newThisMonth: typeof stats.newThisMonth === 'number' ? stats.newThisMonth : 0,
        totalCourses: typeof stats.totalCourses === 'number' ? stats.totalCourses : 0,
        newCourses: typeof stats.newCourses === 'number' ? stats.newCourses : 0,
        averageRating: typeof stats.averageRating === 'number' ? stats.averageRating : 0,
        ratingChange: typeof stats.ratingChange === 'number' ? stats.ratingChange : 0,
      };
    } catch (error) {
      console.error(error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        pending: 0,
        newThisMonth: 0,
        totalCourses: 0,
        newCourses: 0,
        averageRating: 0,
        ratingChange: 0,
      };
    }
  },
  ['instructors-stats'],
  {
    revalidate: 300,
    tags: ['instructors', 'stats'],
  }
);
export const getUsersStats = unstable_cache(
  async (): Promise<UsersStats> => {
    try {
      const response = await serverAdminService.getUsersStats();

      if (!response || !response.success || !response.data) {
        throw new Error(response.message);
      }

      const stats = response.data;

      return {
        total: typeof stats.total === 'number' ? stats.total : 0,
        active: typeof stats.active === 'number' ? stats.active : 0,
        inactive: typeof stats.inactive === 'number' ? stats.inactive : 0,
        blocked: typeof stats.blocked === 'number' ? stats.blocked : 0,
      };
    } catch (error) {
      console.error(error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        blocked: 0,
      };
    }
  },
  ['users-stats'],
  {
    revalidate: 300,
    tags: ['users', 'stats'],
  }
);

/**
 * Get a single instructor by their ID.
 * Cached for 10 minutes.
 */
export const getInstructor = cache(async (instructorId: string): Promise<Instructor | null> => {
  try {
    const result = await serverUserService.getUser(instructorId);
    if (!result.success || !result.data) {
      console.warn(`[getInstructor] Failed: ${result.message || 'Unknown error'}`);
      return null;
    }
    return result.data as Instructor;
  } catch (err) {
    console.error('[getInstructor] Error:', err);
    return null;
  }
});

/**
 * Get statistics about an instructor's courses.
 * Cached for 10 minutes.
 */
export const getInstructorCoursesStats = unstable_cache(
  async (instructorId: string): Promise<CourseStats> => {
    try {
      const response = await serverAdminService.getInstructorCoursesStats(instructorId);
      if (!response || !response.success || !response.data) {
        throw new Error(response.message);
      }
      const stats = response.data;
      return {
        published: typeof stats.published === 'number' ? stats.published : 0,
        draft: typeof stats.draft === 'number' ? stats.draft : 0,
        totalEnrollments: typeof stats.totalEnrollments === 'number' ? stats.totalEnrollments : 0,
        activeStudents: typeof stats.activeStudents === 'number' ? stats.activeStudents : 0,
        monthlyRevenue: typeof stats.monthlyRevenue === 'number' ? stats.monthlyRevenue : 0,
        revenueGrowth: typeof stats.revenueGrowth === 'number' ? stats.revenueGrowth : 0,
        avgCompletionRate:
          typeof stats.avgCompletionRate === 'number' ? stats.avgCompletionRate : 0,
      };
    } catch (error) {
      console.error(error);
      return {
        published: 0,
        draft: 0,
        totalEnrollments: 0,
        activeStudents: 0,
        monthlyRevenue: 0,
        revenueGrowth: 0,
        avgCompletionRate: 0,
      };
    }
  },
  ['instructor-courses-stats'],
  {
    revalidate: 600,
    tags: ['courses', 'stats'],
  }
);
export const getInstructorCourseStats = unstable_cache(
  async (instructorId: string, courseId: string): Promise<CourseAnalytics | null> => {
    try {
      const response = await serverAdminService.getInstructorCourseStats(instructorId, courseId);

      if (!response || !response.success || !response.data) {
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
  ['instructor-course-stats'],
  {
    revalidate: 600,
    tags: ['course', 'stats'],
  }
);

/**
 * Get a single course by its ID.
 * Cached.
 */
export const getCourse = cache(async (courseId: string): Promise<Course | null> => {
  try {
    const result = await serverCourseService.getCourseById(courseId);
    if (!result.success || !result.data) {
      console.warn(`[getCourse] Failed: ${result.message || 'Unknown error'}`);
      return null;
    }
    return result.data;
  } catch (err) {
    console.error('[getCourse] Error:', err);
    return null;
  }
});
export const getCourseStats = cache(
  async (instructorId: string, courseId: string): Promise<CourseStats | null> => {
    const defaultStats: CourseStats = {
      published: 0,
      draft: 0,
      totalEnrollments: 0,
      activeStudents: 0,
      monthlyRevenue: 0,
      revenueGrowth: 0,
      avgCompletionRate: 0,
    };

    try {
      const response = await serverAdminService.getCourseAnalytics(instructorId, courseId);

      if (!response.success || !response.data) {
        console.warn(
          `[getCourseStats] Failed to fetch stats: ${response.message || 'Unknown error'}`
        );
        return defaultStats;
      }

      return {
        published:
          typeof response.data.published === 'number'
            ? response.data.published
            : defaultStats.published,
        draft: typeof response.data.draft === 'number' ? response.data.draft : defaultStats.draft,
        totalEnrollments:
          typeof response.data.totalEnrollments === 'number'
            ? response.data.totalEnrollments
            : defaultStats.totalEnrollments,
        activeStudents:
          typeof response.data.activeStudents === 'number'
            ? response.data.activeStudents
            : defaultStats.activeStudents,
        monthlyRevenue:
          typeof response.data.monthlyRevenue === 'number'
            ? response.data.monthlyRevenue
            : defaultStats.monthlyRevenue,
        revenueGrowth:
          typeof response.data.revenueGrowth === 'number'
            ? response.data.revenueGrowth
            : defaultStats.revenueGrowth,
        avgCompletionRate:
          typeof response.data.avgCompletionRate === 'number'
            ? response.data.avgCompletionRate
            : defaultStats.avgCompletionRate,
      };
    } catch (error) {
      console.error('[getCourseStats] Unexpected error:', error);
      return defaultStats;
    }
  }
);
