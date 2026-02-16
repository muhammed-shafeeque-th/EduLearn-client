/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

// import { useQuery } from '@tanstack/react-query';

// async function fetchInstructors(filters: InstructorsFilter) {
//   const params = new URLSearchParams();
//   console.log('fetchInstructors filters ' + JSON.stringify(filters, null, 2));

//   if (filters.search) params.append('search', filters.search);
//   if (filters.status) params.append('status', filters.status);
//   if (filters.page) params.append('page', filters.page.toString());
//   if (filters.limit) params.append('limit', filters.limit.toString());

//   const response = await useInstructors(`/api/instructors?${params}`);

//   if (!response.ok) {
//     throw new Error('Failed to fetch instructors');
//   }

//   return response.json();
// }

export async function getCourseContent(courseId: string) {
  await new Promise((resolve) => setTimeout(resolve, 400));

  return {
    description:
      "## Advanced React Development\n\nThis comprehensive course covers **Advanced React Development** concepts including:\n\n- Advanced Hooks patterns and custom hooks\n- Performance optimization with React.memo and useMemo\n- State management with Context API and Redux Toolkit\n- Testing strategies with Jest and React Testing Library\n- Server-side rendering with Next.js\n\n### What You'll Build\n\nThroughout this course, you'll build several projects:\n\n1. **Task Management App** - Master hooks and state management\n2. **E-commerce Dashboard** - Learn performance optimization\n3. **Real-time Chat App** - Implement WebSocket integration\n4. **Portfolio Website** - Apply SSR techniques\n\n> *Transform your React skills from intermediate to advanced level with hands-on projects and real-world scenarios.*\n\n### Learning Outcomes\n\nBy the end of this course, you will be able to:\n\n- Build complex React applications with confidence\n- Optimize application performance effectively\n- Implement advanced patterns and best practices\n- Test your applications thoroughly\n- Deploy production-ready React applications",
    sections: [],
    totalDuration: 1200,
    totalLessons: 45,
  };
}

export async function getCourseStudents(courseId: string) {
  await new Promise((resolve) => setTimeout(resolve, 600));

  return {
    total: 156,
    active: 134,
    completed: 67,
    averageProgress: 73,
    students: [], // Would contain actual student data
  };
}

export async function getCourseStats(courseId: string) {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    revenue: 31440,
    enrollments: 156,
    completionRate: 78,
    rating: 4.8,
    engagement: 85,
  };
}

import { Instructor } from '@/types/user';
import { useOptimistic } from 'react';

export function useOptimisticInstructorAction(instructors: Instructor[]) {
  const [optimisticInstructors, setOptimisticInstructors] = useOptimistic(
    instructors,
    (
      state: Instructor[],
      { instructorId, action }: { instructorId: string; action: string }
    ): Instructor[] => {
      return state.map((instructor: Instructor) => {
        if (instructor.id !== instructorId) return instructor;

        switch (action) {
          case 'approve':
            return { ...instructor, status: 'active' as const };
          case 'block':
            return { ...instructor, status: 'blocked' as const };
          case 'unblock':
            return { ...instructor, status: 'active' as const };
          default:
            return instructor;
        }
      });
    }
  );

  return [optimisticInstructors, setOptimisticInstructors] as const;
}
