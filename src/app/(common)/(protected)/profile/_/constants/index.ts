import { User, BookOpen, Shield, MessageCircle } from 'lucide-react';

export const PROFILE_NAVIGATION = [
  {
    href: '/profile',
    label: 'Profile',
    icon: User,
    description: 'Edit your profile information',
  },
  {
    href: '/profile/my-courses',
    label: 'My Courses',
    icon: BookOpen,
    description: 'View your enrolled courses',
  },
  // {
  //   href: '/profile/teachers',
  //   label: 'mentors',
  //   icon: Users,
  //   description: 'Browse available Mentors',
  // },
  {
    href: '/profile/my-chats',
    label: 'My Chats',
    icon: MessageCircle,
    description: 'Chat with teachers',
  },
  {
    href: '/profile/my-orders',
    label: 'My Orders',
    icon: BookOpen,
    description: 'View and manage your course orders and purchases',
  },
  {
    href: '/profile/security',
    label: 'Security',
    icon: Shield,
    description: 'Change password and security settings',
  },
  // {
  //   href: '/profile/settings',
  //   label: 'Settings',
  //   icon: Settings,
  //   description: 'Account preferences and settings',
  // },
] as const;
