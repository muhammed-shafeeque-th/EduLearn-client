export const FORM_LIMITS = {
  TITLE_MAX_LENGTH: 80,
  SUBTITLE_MAX_LENGTH: 120,
  FIELD_TEXT_MAX_LENGTH: 120,
  MAX_DYNAMIC_FIELDS: 8,
  MIN_DYNAMIC_FIELDS: 4,
  THUMBNAIL_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  VIDEO_MAX_SIZE: 100 * 1024 * 1024, // 100MB
} as const;

export const COURSE_STEPS = [
  { id: 'basic', label: 'Basic Information', order: 1 },
  { id: 'advanced', label: 'Advanced Information', order: 2 },
  { id: 'curriculum', label: 'Curriculum', order: 3 },
  { id: 'publish', label: 'Publish Course', order: 4 },
] as const;

export const ANIMATION_VARIANTS = {
  slideIn: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  },
} as const;

export const categories = ['Technology', 'Business', 'Design', 'Marketing', 'Programming'];

export const subCategories: Record<string, string[]> = {
  Technology: ['Web Development', 'Mobile Development', 'Data Science'],
  Business: ['Entrepreneurship', 'Finance', 'Management'],
  Design: ['UI/UX', 'Graphic Design', 'Animation'],
  Marketing: ['Digital Marketing', 'SEO', 'Social Media'],
  Programming: ['Frontend', 'Backend', 'Full Stack'],
};

export const languages = ['English', 'Spanish', 'French', 'German', 'Chinese'];
export const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
export const durationUnits = ['days', 'weeks', 'months'];
