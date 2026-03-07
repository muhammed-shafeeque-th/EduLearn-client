/* eslint-disable @typescript-eslint/no-explicit-any */
export const QUERY_KEYS = {
  // User queries
  users: {
    all: ['users'] as const,
    stats: ['users', 'stats'] as const,
    usersStats: () => [...QUERY_KEYS.users.stats, 'users'] as const,
    instructorsStats: () => [...QUERY_KEYS.users.stats, 'instructors'] as const,
    instructorStats: (instructorId: string) =>
      [...QUERY_KEYS.users.stats, 'instructor', instructorId] as const,
    instructorCoursesStats: (instructorId: string) =>
      [...QUERY_KEYS.users.stats, 'instructor', instructorId, 'courses'] as const,
    instructorCourseStats: (instructorId: string, courseId: string) =>
      [...QUERY_KEYS.users.stats, 'instructor', instructorId, 'courses', courseId] as const,
    lists: () => [...QUERY_KEYS.users.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...QUERY_KEYS.users.lists(), { filters }] as const,
    details: () => [...QUERY_KEYS.users.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.users.details(), id] as const,
    current: () => [...QUERY_KEYS.users.all, 'current'] as const,
    profile: (id: string) => [...QUERY_KEYS.users.details(), id, 'profile'] as const,
    instructors: (filters?: any) => [...QUERY_KEYS.users.all, 'instructors', filters] as const,
  },
  // wallet queries
  wallet: {
    all: ['wallet'] as const,
    // current: () => [...QUERY_KEYS.wallet.all, 'current'] as const,
    user: (userId: string) => [...QUERY_KEYS.wallet.all, 'user', userId] as const,
    transactions: (userId: string, filters?: Record<string, any>) =>
      [...QUERY_KEYS.wallet.all, 'transactions', userId, filters ?? {}] as const,
    transactionDetail: (userId: string, transactionId: string) =>
      [...QUERY_KEYS.wallet.transactions(userId), transactionId] as const,
    overview: (userId: string) => [...QUERY_KEYS.wallet.all, 'overview', userId] as const,
  },
  // Order queries
  orders: {
    all: ['orders'] as const,
    lists: () => [...QUERY_KEYS.orders.all, 'list'] as const,
    list: (userId: string, filters?: Record<string, any>) =>
      [...QUERY_KEYS.orders.lists(), userId, { filters }] as const,
    details: () => [...QUERY_KEYS.orders.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.orders.details(), id] as const,
    current: () => [...QUERY_KEYS.orders.all, 'current'] as const,
  },
  // Course queries
  enrollment: {
    all: ['enrollments'] as const,
    ids: (userId: string) => [...QUERY_KEYS.enrollment.all, 'user', userId, 'ids'] as const,
    progress: (id: string) => [...QUERY_KEYS.enrollment.all, 'progress', id] as const,
    videoUrl: (enrollmentId: string, lessonId: string) =>
      [...QUERY_KEYS.enrollment.all, 'video-url', enrollmentId, lessonId] as const,
    me: ['enrollment', 'me'] as const,
    lists: (userId: string) => [...QUERY_KEYS.enrollment.all, userId, 'list'] as const,
    list: (userId: string, filters: Record<string, any>) =>
      [...QUERY_KEYS.enrollment.lists(userId), { filters }] as const,
    details: (userId: string) => [...QUERY_KEYS.enrollment.all, userId, 'detail'] as const,
    detail: (userId: string, id: string) => [...QUERY_KEYS.enrollment.details(userId), id] as const,
  },
  certificates: {
    all: ['certificates'] as const,
    byUser: (userId: string) => [...QUERY_KEYS.certificates.all, 'user', userId] as const,
    byEnrollment: (enrollmentId: string) =>
      [...QUERY_KEYS.certificates.all, 'enrollment', enrollmentId] as const,
    byId: (id: string) => [...QUERY_KEYS.certificates.all, 'id', id] as const,
  },
  review: {
    all: ['review'] as const,
    enrollment: (enrollmentId: string) =>
      [...QUERY_KEYS.review.all, 'enrollment', enrollmentId] as const,
    id: (id: string) => [...QUERY_KEYS.review.all, 'id', id] as const,
  },
  courses: {
    all: ['courses'] as const,
    stats: ['courses', 'stats'] as const,
    coursesStats: () => [QUERY_KEYS.courses.stats, 'courses'] as const,
    courseAnalytics: () => [QUERY_KEYS.courses.stats, 'courses', 'analytics'] as const,
    lists: () => [...QUERY_KEYS.courses.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...QUERY_KEYS.courses.lists(), { filters }] as const,
    details: () => [...QUERY_KEYS.courses.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.courses.details(), id] as const,
    byInstructor: (instructorId: string, filters?: any) =>
      [...QUERY_KEYS.courses.all, 'instructor', instructorId, filters] as const,
    enrolled: (userId: string) => [...QUERY_KEYS.courses.all, 'enrolled', userId] as const,
    analytics: (id: string) => [...QUERY_KEYS.courses.detail(id), 'analytics'] as const,
    reviews: (id: string, params?: any) =>
      [...QUERY_KEYS.courses.detail(id), 'reviews', { params }] as const,
    lessons: (id: string) => [...QUERY_KEYS.courses.detail(id), 'lessons'] as const,
    categories: () => [...QUERY_KEYS.courses.all, 'categories'] as const,
    featured: () => [...QUERY_KEYS.courses.all, 'featured'] as const,
  },

  // Cart & Wishlist queries
  cart: {
    all: ['cart'] as const,
    user: (userId: string) => [...QUERY_KEYS.cart.all, userId] as const,
    count: (userId: string) => [...QUERY_KEYS.cart.user(userId), 'count'] as const,
  },

  wishlist: {
    all: ['wishlist'] as const,
    user: (userId: string) => [...QUERY_KEYS.wishlist.all, userId] as const,
    count: (userId: string) => [...QUERY_KEYS.wishlist.user(userId), 'count'] as const,
  },

  // Chat queries
  chat: {
    all: ['chat'] as const,
    chats: (role: 'instructor' | 'student', filters?: any) =>
      [...QUERY_KEYS.chat.all, 'chats', role, filters] as const,
    // Convenience shortcuts
    instructorChats: (filters?: any) => QUERY_KEYS.chat.chats('instructor', filters),
    studentChats: (filters?: any) => QUERY_KEYS.chat.chats('student', filters),
    chat: (id: string) => [...QUERY_KEYS.chat.all, id] as const,
    messages: (chatId: string) => [...QUERY_KEYS.chat.chat(chatId), 'messages'] as const,
    studentMessages: (chatId: string) =>
      [...QUERY_KEYS.chat.chat(chatId), 'student-messages'] as const,
    unreadCount: () => [...QUERY_KEYS.chat.all, 'unreadCount'] as const,
  },
  discussion: {
    all: ['discussion-room'] as const,
    byCourse: (courseId: string) => [QUERY_KEYS.discussion.all, courseId] as const,
    messages: (roomId: string) => [QUERY_KEYS.discussion.all, 'messages', roomId] as const,
  },

  // Admin queries
  admin: {
    all: ['admin'] as const,
    stats: ['admin', 'stats'] as const,
    systemOverview: () => [...QUERY_KEYS.admin.stats, 'overview'],
    revenueStats: (year?: string) => [...QUERY_KEYS.admin.stats, 'revenue', year],
    enrollmentTrend: (year?: string) => [...QUERY_KEYS.admin.stats, 'enrollment-trend', year],
    userGrowthTrend: (year?: string) => [...QUERY_KEYS.admin.stats, 'user-growth-trend', year],
    instructorGrowthTrend: (year?: string) => [
      ...QUERY_KEYS.admin.stats,
      'instructor-growth-trend',
      year,
    ],
    dashboard: () => [...QUERY_KEYS.admin.all, 'dashboard'] as const,
    analytics: () => [...QUERY_KEYS.admin.all, 'analytics'] as const,
    reports: (type: string, filters?: any) =>
      [...QUERY_KEYS.admin.all, 'reports', type, { filters }] as const,
    users: (filters: any) => [...QUERY_KEYS.admin.all, 'users', { filters }] as const,
  },

  // Notification queries
  notifications: {
    all: ['notifications'] as const,
    lists: () => [...QUERY_KEYS.notifications.all, 'list'] as const,
    list: (userId: string, filters: Record<string, any>) =>
      [...QUERY_KEYS.notifications.lists(), userId, { filters }] as const,
    details: (userId: string) => [...QUERY_KEYS.notifications.all, userId, 'detail'] as const,
    detail: (userId: string, id: string) =>
      [...QUERY_KEYS.notifications.details(userId), id] as const,
    unreadCount: () => [...QUERY_KEYS.notifications.all, 'unreadCount'] as const,
  },
} as const;
