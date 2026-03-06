import { User, BookOpen, Shield, MessageCircle, Award } from 'lucide-react';

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
  {
    href: '/profile/certificates',
    label: 'Certificates',
    icon: Award,
    description: 'View your course certificates',
  },
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
] as const;
