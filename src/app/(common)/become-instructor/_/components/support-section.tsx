'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Headphones, MessageCircle, FileText, Clock, LucideIcon } from 'lucide-react';
import Image from 'next/image';

// Type for support feature for type-safety and clarity
type SupportFeature = {
  icon: LucideIcon;
  title: string;
};

const SUPPORT_FEATURES: ReadonlyArray<SupportFeature> = [
  {
    icon: Headphones,
    title: 'Get live support for help, training or technical difficulties',
  },
  {
    icon: MessageCircle,
    title: 'Connect with experts & colleagues across departments',
  },
  {
    icon: FileText,
    title: 'Build a shared knowledge base with team documentation',
  },
  {
    icon: Clock,
    title: '24/7 phone and email support',
  },
];

// Memoized Feature Item for reusability and best practices
interface SupportFeatureItemProps {
  feature: SupportFeature;
  index: number;
}
const SupportFeatureItem: React.FC<SupportFeatureItemProps> = React.memo(({ feature, index }) => {
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className="flex items-start gap-4"
      aria-label={feature.title}
    >
      <div className="w-12 h-12 bg-primary/10 dark:bg-primary/90 rounded-xl flex items-center justify-center flex-shrink-0">
        <Icon className="w-6 h-6 text-primary/60 dark:text-secondary" aria-hidden="true" />
      </div>
      <p className="text-gray-600 dark:text-gray-300 text-lg">{feature.title}</p>
    </motion.div>
  );
});
SupportFeatureItem.displayName = 'SupportFeatureItem';

export function SupportSection(): React.JSX.Element {
  return (
    <section
      className="py-12 lg:py-20 bg-primary/5 dark:bg-gray-900"
      aria-labelledby="support-section-title"
    >
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
            className="relative order-last lg:order-first"
            aria-hidden="true"
          >
            <div className="relative">
              <Image
                src="/instructors/support-team.jpg"
                alt="Support team members"
                width={600}
                height={600}
                className="w-full h-auto rounded-3xl shadow-2xl"
                priority
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2
                id="support-section-title"
                className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white"
              >
                Don&apos;t worry, we&apos;re always{' '}
                <span className="text-primary/90">here to help you</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                No matter where or when you reach out, our team is available anytime, anywhere to
                assist you.
              </p>
            </div>
            <ul className="space-y-4" aria-label="Support features list">
              {SUPPORT_FEATURES.map((feature, idx) => (
                <li key={feature.title}>
                  <SupportFeatureItem feature={feature} index={idx} />
                </li>
              ))}
            </ul>
            <div className="pt-4">
              <p
                className="text-primary/60 dark:text-primary/90 font-semibold"
                aria-label="Support email"
              >
                📧 help.edulearn@gmail.com
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
