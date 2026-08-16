import { BookOpen, Tag, Newspaper, Info, HelpCircle, Mail, type LucideIcon } from 'lucide-react';
import { ROUTES } from './routes';

export interface NavLinkConfig {
  href: string;
  label: string;
  icon: LucideIcon;
}

/**
 * The full public marketing nav. Both the desktop header nav and the
 * mobile drawer should map over this array instead of hand-listing links —
 * that's what let "Pricing / Blog / About / FAQ / Contact" silently
 * disappear from the mobile menu while staying in the desktop nav.
 */
export const PUBLIC_NAV_LINKS: NavLinkConfig[] = [
  { href: ROUTES.public.courses.root, label: 'Courses', icon: BookOpen },
  { href: ROUTES.public.pricing, label: 'Pricing', icon: Tag },
  { href: ROUTES.public.blog, label: 'Blog', icon: Newspaper },
  { href: ROUTES.public.about, label: 'About', icon: Info },
  { href: ROUTES.public.faq, label: 'FAQ', icon: HelpCircle },
  { href: ROUTES.public.contact, label: 'Contact', icon: Mail },
];
