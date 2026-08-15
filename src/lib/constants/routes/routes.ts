import { config } from '@/lib/config';

/**
## Public routes should be optimized for: ##

- metadata
- Open Graph
- *JSON-LD* 
- sitemap inclusion @see[link](http://localhost:900)
- static generation
- caching

## Application routes should usually be: ##

 - authenticated
- dynamic
- excluded from sitemap
- dex where appropriate
 
*/
export const ROUTES = {
  public: {
    home: '/',
    about: '/about',
    contact: '/contact',
    support: '/support',
    faq: '/faq',
    pricing: '/pricing',
    blog: '/blog',
    blogPost: (slug: string) => `/blog/${slug}`,
    careers: '/careers',
    privacy: '/privacy',
    terms: '/terms',
    courses: {
      root: '/courses',
      course: (slug: string) => `/courses/${slug}`,
    },
    instructors: {
      root: '/instructors',
      profile: (id: string) => `/instructors/${id}`,
    },
    becomeInstructor: {
      root: '/become-instructor',
      register: '/become-instructor/register',
    },
  },

  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
    callback: '/auth/callback',
  },

  student: {
    dashboard: '/dashboard',

    learn: (enrollmentId: string) => `/learn/${enrollmentId}`,

    profile: {
      root: '/profile',
      security: '/profile/security',
      certificates: '/profile/certificates',
      certificate: (certificateId: string) => `/profile/certificates/${certificateId}`,
    },

    orders: {
      root: '/orders',
      order: (id: string) => `/orders/${id}`,
    },

    courses: {
      root: '/my-courses',
      course: (id: string) => `/my-courses/${id}`,
    },

    chats: {
      root: '/chats',
      chat: (id: string) => `/chats/${id}`,
    },

    cart: '/cart',
    wishlist: '/wishlist',
    checkout: '/checkout',
    notifications: '/notifications',
  },

  instructor: {
    root: '/instructor',
    dashboard: '/instructor',

    courses: {
      root: '/instructor/courses',
      create: '/instructor/courses/create',
      course: (id: string) => `/instructor/courses/${id}`,
      edit: (id: string) => `/instructor/courses/${id}/edit`,
      analytics: (id: string) => `/instructor/courses/${id}/analytics`,
      discussion: (id: string) => `/instructor/courses/${id}/discussion`,
    },

    chats: {
      root: '/instructor/chats',
      chat: (id: string) => `/instructor/chats/${id}`,
    },

    revenue: '/instructor/revenue',
  },

  admin: {
    root: '/admin',

    auth: {
      login: '/admin/auth/login',
      callback: '/admin/auth/callback',
    },

    users: {
      root: '/admin/users',
      user: (id: string) => `/admin/users/${id}`,
    },

    instructors: {
      root: '/admin/instructors',
      instructor: (id: string) => `/admin/instructors/${id}`,
      courses: (id: string) => `/admin/instructors/${id}/courses`,
      course: (instructorId: string, courseId: string) =>
        `/admin/instructors/${instructorId}/courses/${courseId}`,
    },
  },

  payment: {
    root: '/payment',
    session: (paymentId: string) => `/payment/${paymentId}`,
    success: `/payment/success`,
    failure: `/payment/failure`,
    callback: `/payment/callback`,
    // success: (paymentId: string) => `/payment/${paymentId}/success`,
    // failure: (paymentId: string) => `/payment/${paymentId}/failure`,
    // callback: (paymentId: string) => `/payment/${paymentId}/callback`,
  },
} as const;

/** Build a fully-qualified URL for canonical tags, OG tags, and JSON-LD. */
export function absoluteUrl(path: string): string {
  return new URL(path, config.siteUrl).toString();
}
