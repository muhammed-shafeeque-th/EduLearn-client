'use client';

import { useState, useEffect } from 'react';
import type { Course } from '@/types/course';

interface UseMyCourses {
  data: Course[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Mock data generator
function generateMockCourses(): Course[] {
  return Array.from({ length: 15 }, (_, i) => ({
    id: `course-${i + 1}`,
    title: `${getRandomCourseTitle()} - Course ${i + 1}`,
    description: 'Learn the fundamentals and create amazing projects with hands-on experience.',
    thumbnail: `/courses/course-${(i % 8) + 1}.jpg`,
    instructor: {
      id: `instructor-${i + 1}`,
      firstName: getRandomFirstName(),
      lastName: getRandomLastName(),
      email: `instructor${i + 1}@example.com`,
      avatar: `/avatars/instructor-${(i % 6) + 1}.jpg`,
      role: 'teacher' as const,
    },
    rating: Number((4.0 + Math.random() * 1.0).toFixed(1)),
    ratingsCount: Math.floor(Math.random() * 2000) + 100,
    price: Math.floor(Math.random() * 150) + 29,
    category: getRandomCategory(),
    level: getRandomLevel(),
    duration: `${Math.floor(Math.random() * 10) + 2} weeks`,
    lessonsCount: Math.floor(Math.random() * 25) + 8,
    enrolledAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
    progress: Math.floor(Math.random() * 101), // 0-100%
    isCompleted: Math.random() > 0.7,
  }));
}

function getRandomCourseTitle() {
  const titles = [
    'Complete Web Development',
    'Advanced React & TypeScript',
    'Digital Marketing Mastery',
    'Data Science with Python',
    'UI/UX Design Fundamentals',
    'Mobile App Development',
    'Machine Learning Basics',
    'Photography Essentials',
    'Business Strategy & Leadership',
    'Creative Writing Workshop',
    'Financial Planning',
    'Graphic Design Principles',
  ];
  return titles[Math.floor(Math.random() * titles.length)];
}

function getRandomFirstName() {
  const names = ['Alex', 'Jordan', 'Casey', 'Morgan', 'Taylor', 'Jamie', 'Riley', 'Cameron'];
  return names[Math.floor(Math.random() * names.length)];
}

function getRandomLastName() {
  const names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Garcia'];
  return names[Math.floor(Math.random() * names.length)];
}

function getRandomCategory() {
  const categories = [
    'Design',
    'Development',
    'Business',
    'Marketing',
    'Data Science',
    'Photography',
    'Writing',
  ];
  return categories[Math.floor(Math.random() * categories.length)];
}

function getRandomLevel() {
  const levels = ['beginner', 'intermediate', 'advanced'];
  return levels[Math.floor(Math.random() * levels.length)] as
    | 'beginner'
    | 'intermediate'
    | 'advanced';
}

export function useMyCourses(): UseMyCourses {
  const [data, setData] = useState<Course[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // In a real app, this would be an API call
      const courses = generateMockCourses();

      setData(courses);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch courses'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const refetch = () => {
    fetchCourses();
  };

  return { data, isLoading, error, refetch };
}
