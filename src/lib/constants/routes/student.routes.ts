export const STUDENT_ROUTES = {
  dashboard: '/dashboard',

  profile: {
    root: '/profile',
    security: '/profile/security',
  },

  courses: {
    root: '/my-courses',
    course: (id: string) => `/my-courses/${id}`,
  },
} as const;
