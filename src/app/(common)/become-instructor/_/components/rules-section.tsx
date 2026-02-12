'use client';

import React, { JSX } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import Image from 'next/image';

// Enhanced: Clearer, actionable, professional rules
const INSTRUCTOR_RULES: string[] = [
  'All content must be original and not duplicate conventional teaching resources.',
  'You are free to choose your own teaching style and course topics, as long as they adhere to our guidelines.',
  'Respect platform formats by maintaining consistency in class, lesson, and blog structures.',
  'Content should not encourage students to illegally share, sell, or trade video or course material.',
  'Exceptional teaching is recognized: positive ratings and reviews are based on student satisfaction.',
];

export function RulesSection(): JSX.Element {
  return (
    <section
      className="py-12 lg:py-20 bg-gray-50 dark:bg-gray-800"
      aria-labelledby="instructor-rules-title"
    >
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h2
                id="instructor-rules-title"
                className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white"
              >
                Instructor <span className="text-primary/90">rules & regulations</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                EduLearn provides clear and simple guidelines to ensure a positive learning
                experience for all instructors and students. Please review our core rules and
                regulations below.
              </p>
            </div>

            <ul className="space-y-4" aria-label="Instructor rules list">
              {INSTRUCTOR_RULES.map((rule, index) => (
                <motion.li
                  key={rule}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle
                    className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span className="text-gray-700 dark:text-gray-200">{rule}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
            className="relative"
            aria-hidden="true"
          >
            <div className="relative">
              <Image
                src="/instructors/instructor-rules.jpg"
                alt="Instructor working on laptop"
                width={600}
                height={600}
                className="w-full h-auto rounded-3xl shadow-2xl"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
