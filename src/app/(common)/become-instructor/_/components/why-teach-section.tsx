'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, DollarSign, Users, LucideIcon } from 'lucide-react';
import Image from 'next/image';

// -- Types and constants --

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const FEATURES: ReadonlyArray<Feature> = [
  {
    icon: CheckCircle,
    title: 'Teach your students as you want',
    description:
      'Publish the course you want, in the way you want, and always have control of your own content.',
  },
  {
    icon: DollarSign,
    title: 'Manage your course and payment in one place',
    description:
      'Everything you need to manage your courses and payments, all in one convenient dashboard.',
  },
  {
    icon: Users,
    title: 'Chat with your students',
    description:
      'Build a community around your courses and engage directly with your students through our messaging system.',
  },
];

// Memoized component for a single feature for best performance and reusability
interface FeatureItemProps {
  feature: Feature;
  index: number;
}
const FeatureItem: React.FC<FeatureItemProps> = React.memo(({ feature, index }) => {
  const Icon = feature.icon;
  return (
    <motion.div
      key={feature.title}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ delay: index * 0.15, duration: 0.6 }}
      className="flex gap-4"
      aria-label={feature.title}
    >
      <div className="flex-shrink-0">
        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
          <Icon className="w-6 h-6 text-green-600 dark:text-green-400" aria-hidden="true" />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
        <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
      </div>
    </motion.div>
  );
});
FeatureItem.displayName = 'FeatureItem';

// -- Main section component --

export function WhyTeachSection(): React.JSX.Element {
  return (
    <section
      className="py-12 lg:py-20 bg-gray-50 dark:bg-gray-800"
      aria-labelledby="why-teach-title"
    >
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2
                id="why-teach-title"
                className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white"
              >
                Why you&apos;ll start teaching on{' '}
                <span className="text-primary/50 dark:text-primary/90">EduLearn</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Expand campus-driven discovery and collaboration. From interactive study groups to
                hands-on projects, EduLearn enhances student learning experiences.
              </p>
            </div>
            <ul className="space-y-6" aria-label="Platform benefits">
              {FEATURES.map((feature, index) => (
                <li key={feature.title}>
                  <FeatureItem feature={feature} index={index} />
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
            className="relative"
            aria-hidden="true"
          >
            <div className="relative bg-white dark:bg-gray-700 rounded-3xl p-8 shadow-2xl">
              <Image
                src="/instructors/teaching-platform.jpg"
                alt="Teaching platform interface"
                width={600}
                height={400}
                className="w-full h-auto rounded-2xl"
                priority
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
