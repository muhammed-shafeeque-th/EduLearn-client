'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Star, Users, DollarSign } from 'lucide-react';

// Stats data as constant array for scalability and maintainability
const QUICK_STATS = [
  {
    icon: Users,
    value: '2M+',
    label: 'Students',
    iconClass: 'text-blue-500',
    'aria-label': 'Over 2 million students',
  },
  {
    icon: DollarSign,
    value: '₹2.5k',
    label: 'Avg. Monthly',
    iconClass: 'text-green-500',
    'aria-label': 'Average monthly earnings ₹2,500',
  },
];

const RegistrationHero = () => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="space-y-6"
    aria-label="Registration introduction"
  >
    <header className="space-y-4">
      <div
        className="inline-flex items-center gap-2 bg-primary/10 dark:bg-primary text-primary/90 dark:text-white px-4 py-2 rounded-full text-sm font-medium"
        role="status"
        aria-live="polite"
      >
        <Star className="w-4 h-4 fill-current" aria-hidden="true" />
        Join 20k+ successful instructors
      </div>
      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
        Start Your{' '}
        <span className="bg-gradient-to-r from-primary/80 to-blue-500 bg-clip-text text-transparent">
          Teaching Journey
        </span>
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300">
        Join thousands of successful instructors who are making a difference in students&apos; lives
        while building their own thriving online teaching business.
      </p>
    </header>

    {/* Quick Stats */}
    <ul className="grid grid-cols-2 gap-4" aria-label="Quick stats">
      {QUICK_STATS.map(({ icon: Icon, value, label, iconClass, ...rest }) => (
        <li
          key={label}
          className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
          {...rest}
        >
          <Icon className={`w-8 h-8 ${iconClass} mx-auto mb-2`} aria-hidden="true" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
          <div className="text-sm text-gray-500">{label}</div>
        </li>
      ))}
    </ul>
  </motion.section>
);

export default memo(RegistrationHero);
