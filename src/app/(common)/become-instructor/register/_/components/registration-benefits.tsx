'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Globe, TrendingUp, Users, Shield, Headphones, LucideIcon } from 'lucide-react';

interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
  'aria-label'?: string;
}

// Immutable, strongly-typed benefits data
const BENEFITS: Benefit[] = [
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'Teach students from over 190 countries worldwide',
    'aria-label': 'Global reach: teach students from over 190 countries',
  },
  {
    icon: TrendingUp,
    title: 'Unlimited Earning',
    description: 'Set your own prices and keep up to 97% of your earnings',
    'aria-label': 'Unlimited earning: set prices, keep up to 97% of earnings',
  },
  {
    icon: Users,
    title: 'Marketing Support',
    description: 'We help promote your courses to the right audience',
    'aria-label': 'Marketing support: courses promoted to the right audience',
  },
  {
    icon: Shield,
    title: 'Content Protection',
    description: 'Your intellectual property is protected with DRM',
    'aria-label': 'Content protection: DRM security for your work',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Get help from our instructor success team anytime',
    'aria-label': '24/7 support: get help anytime from our team',
  },
];

const REGISTRATION_BENEFITS_ANIMATION = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay: 0.2 },
};

const BENEFIT_ITEM_ANIMATION = (index: number) => ({
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { delay: index * 0.1, duration: 0.5 },
});

function RegistrationBenefitsComponent() {
  return (
    <motion.section
      {...REGISTRATION_BENEFITS_ANIMATION}
      className="space-y-6"
      aria-label="EduLearn registration benefits"
      tabIndex={-1}
    >
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Why Choose EduLearn?</h2>
      <ul className="space-y-4" aria-label="List of instructor benefits">
        {BENEFITS.map(({ icon: Icon, title, description, ...rest }, index) => (
          <motion.li
            key={title}
            {...BENEFIT_ITEM_ANIMATION(index)}
            className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            role="listitem"
            {...rest}
          >
            <span className="w-12 h-12 bg-primary/10 dark:bg-primary/90 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon
                className="w-6 h-6 text-primary dark:text-white"
                aria-hidden="true"
                focusable="false"
              />
            </span>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
            </div>
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
}

export const RegistrationBenefits = memo(RegistrationBenefitsComponent);
