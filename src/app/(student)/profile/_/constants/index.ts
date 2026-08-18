import { ROUTES } from '@/lib/constants/routes';
import { User, BookOpen, Shield, MessageCircle, Award } from 'lucide-react';

export const PROFILE_NAVIGATION = [
  {
    href: ROUTES.student.profile.root,
    label: 'Profile',
    icon: User,
    description: 'Edit your profile information',
  },
  {
    href: ROUTES.student.profile.courses.root,
    label: 'My Courses',
    icon: BookOpen,
    description: 'View your enrolled courses',
  },
  {
    href: ROUTES.student.profile.certificates,
    label: 'Certificates',
    icon: Award,
    description: 'View your course certificates',
  },
  {
    href: ROUTES.student.profile.chats.root,
    label: 'My Chats',
    icon: MessageCircle,
    description: 'Chat with teachers',
  },
  {
    href: ROUTES.student.profile.orders.root,
    label: 'My Orders',
    icon: BookOpen,
    description: 'View and manage your course orders and purchases',
  },
  {
    href: ROUTES.student.profile.security,
    label: 'Security',
    icon: Shield,
    description: 'Change password and security settings',
  },
] as const;
