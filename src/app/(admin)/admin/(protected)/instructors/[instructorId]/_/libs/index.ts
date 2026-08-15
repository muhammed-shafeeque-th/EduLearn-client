'use server';

import { serverCourseService } from '@/services/server-service-clients';
import { unstable_cache } from 'next/cache';

export interface InstructorStatsData {
  monthlyRevenue: number;
  revenueGrowth: number;
  monthlyEnrollments: number;
  enrollmentGrowth: number;
  averageRating: number;
  totalReviews: number;
  responseTime: number;
  completionRate: number;
  engagementRate: number;
  activeCourses: number;
  totalDiscussions: number;
  hoursTeached: number;
}

export const getInstructorStats = unstable_cache(
  async (_instructorId: string): Promise<InstructorStatsData> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      monthlyRevenue: 5940,
      revenueGrowth: 12.5,
      monthlyEnrollments: 45,
      enrollmentGrowth: 8.3,
      averageRating: 4.8,
      totalReviews: 156,
      responseTime: 2.5,
      completionRate: 78,
      engagementRate: 85,
      activeCourses: 6,
      totalDiscussions: 234,
      hoursTeached: 1450,
    };
  },

  [`instructor-stats`],
  {
    revalidate: 300,
    tags: ['instructor-stats'],
  }
);

export interface InstructorCourse {
  id: string;
  title: string;
  description: string;
  status: 'published' | 'draft' | 'archived';
  enrolledStudents: number;
  rating: number;
  completionRate: number;
  revenue: number;
  lastUpdated: string;
  thumbnail?: string;
}

export const getInstructorCourses = unstable_cache(
  async (instructorId: string, limit: number = 5) => {
    const coursesRes = await serverCourseService.getCoursesByInstructor(instructorId, {
      page: 1,
      pageSize: limit,
    });

    if (!coursesRes?.success) {
      throw new Error(coursesRes?.message ?? 'Unknown error while fetching instructor courses.');
    }

    return {
      courses: Array.isArray(coursesRes.data) ? coursesRes.data : [],
      ...(coursesRes.pagination ?? {}),
    };

    /*
    await new Promise((resolve) => setTimeout(resolve, 600));
    return [
      {
        id: '1',
        title: 'Advanced React Development',
        description: 'Master advanced React concepts including hooks, context, and performance optimization.',
        status: 'published',
        enrolledStudents: 156,
        rating: 4.8,
        completionRate: 78,
        revenue: 31200,
        lastUpdated: '2024-07-20',
      },
      {
        id: '2',
        title: 'Next.js Full Stack Development',
        description: 'Build full-stack applications with Next.js and modern tools.',
        status: 'published',
        enrolledStudents: 89,
        rating: 4.6,
        completionRate: 82,
        revenue: 22250,
        lastUpdated: '2024-07-18',
      },
      {
        id: '3',
        title: 'TypeScript Fundamentals',
        description: 'Learn TypeScript from basics to advanced concepts.',
        status: 'draft',
        enrolledStudents: 0,
        rating: 0,
        completionRate: 0,
        revenue: 0,
        lastUpdated: '2024-07-25',
      },
    ].slice(0, limit);
    */
  },
  ['instructor-courses'],
  {
    revalidate: 600,
    tags: ['instructor-courses'],
  }
);
