'use client';

import React, { JSX } from 'react';
import { motion, Variants } from 'framer-motion';
import Image from 'next/image';

// TypeScript: Type for instructor data
type Instructor = {
  id: number;
  image: string;
  name: string;
};

// Data: Array of instructor profiles
const INSTRUCTORS: Instructor[] = [
  { id: 1, image: '/instructors/instructor-1.jpg', name: 'Sarah Johnson' },
  { id: 2, image: '/instructors/instructor-2.jpg', name: 'Mike Chen' },
  { id: 3, image: '/instructors/instructor-3.jpg', name: 'Emily Davis' },
  { id: 4, image: '/instructors/instructor-4.jpg', name: 'David Wilson' },
  { id: 5, image: '/instructors/instructor-5.jpg', name: 'Lisa Brown' },
  { id: 6, image: '/instructors/instructor-6.jpg', name: 'John Smith' },
  { id: 7, image: '/instructors/instructor-7.jpg', name: 'Anna Lee' },
  { id: 8, image: '/instructors/instructor-8.jpg', name: 'Carlos Rodriguez' },
];

// Animation variants for performance and scalability
const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
    },
  }),
};

const containerVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
};

const contentVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
};

// Extracted InstructorCard for reusability and clarity
const InstructorCard: React.FC<{ instructor: Instructor; index: number }> = React.memo(
  ({ instructor, index }) => (
    <motion.div
      key={instructor.id}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="relative group"
      aria-label={`Instructor: ${instructor.name}`}
      tabIndex={0}
    >
      <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-pink-100 dark:from-primary/90 dark:to-pink-900/30">
        <Image
          src={instructor.image}
          alt={instructor.name}
          width={200}
          height={200}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          priority={index < 3}
        />
      </div>
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-center justify-center">
        <span className="text-white font-medium text-sm">{instructor.name}</span>
      </div>
    </motion.div>
  )
);
InstructorCard.displayName = 'InstructorCard';

export function SuccessStoriesSection(): JSX.Element {
  return (
    <section
      className="py-12 lg:py-20 bg-white dark:bg-gray-800"
      aria-labelledby="success-stories-title"
    >
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Content Side */}
          <motion.div
            variants={contentVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h2
                id="success-stories-title"
                className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white"
              >
                <span className="text-primary/50 dark:text-primary/90">20k+</span> instructors
                created their success story with{' '}
                <span className="text-primary/50 dark:text-primary/90">EduLearn</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Join thousands of teachers who have grown their impact and income with EduLearn. Our
                global community ensures a supportive, diverse, and unmatched teaching ecosystem.
              </p>
            </div>
            {/* Metrics Section */}
            <section
              aria-labelledby="success-metrics-heading"
              className="bg-primary/10 dark:bg-primary/5 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/50 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg" aria-hidden="true">
                    📊
                  </span>
                </div>
                <div>
                  <h3
                    id="success-metrics-heading"
                    className="font-semibold text-gray-900 dark:text-white"
                  >
                    Success Metrics
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Real results from our instructors
                  </p>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-4" aria-label="Instructor success metrics">
                <div className="text-center">
                  <dt className="text-2xl font-bold text-primary/60 dark:text-primary/90">95%</dt>
                  <dd className="text-sm text-gray-600 dark:text-gray-400">
                    Instructor Satisfaction
                  </dd>
                </div>
                <div className="text-center">
                  <dt className="text-2xl font-bold text-primary/60 dark:text-primary/90">$2.5k</dt>
                  <dd className="text-sm text-gray-600 dark:text-gray-400">
                    Average Monthly Earnings
                  </dd>
                </div>
              </dl>
            </section>
          </motion.div>

          {/* Instructor Images Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            className="grid grid-cols-3 gap-4"
            aria-label="Featured Instructors Gallery"
            role="list"
          >
            {INSTRUCTORS.map((instructor, index) => (
              <InstructorCard instructor={instructor} index={index} key={instructor.id} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
