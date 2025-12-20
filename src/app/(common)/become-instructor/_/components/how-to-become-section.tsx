'use client';

import React, { JSX } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, BookOpen, VideoIcon, Star } from 'lucide-react';

// Type for each step
type Step = {
  step: number;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
};

// Steps Data - descriptive, consistent language, concise
const STEPS: Step[] = [
  {
    step: 1,
    title: 'Apply to become an instructor',
    description: 'Submit your application to share your expertise and reach eager learners.',
    icon: UserPlus,
    color: 'bg-blue-500',
  },
  {
    step: 2,
    title: 'Set up your profile',
    description: 'Complete your profile with relevant details and teaching background.',
    icon: BookOpen,
    color: 'bg-green-500',
  },
  {
    step: 3,
    title: 'Create your first course',
    description: 'Upload videos, organize content, and design engaging learning experiences.',
    icon: VideoIcon,
    color: 'bg-purple-500',
  },
  {
    step: 4,
    title: 'Start teaching & earning',
    description: 'Publish your course, teach students, and earn for your shared knowledge.',
    icon: Star,
    color: 'bg-primary/50',
  },
];

// StepCard Component for readability, reusability & separation of concerns
interface StepCardProps {
  step: Step;
  index: number;
}
const StepCard: React.FC<StepCardProps> = React.memo(({ step, index }) => {
  const Icon = step.icon;
  return (
    <motion.div
      key={step.step}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ delay: index * 0.18, duration: 0.5 }}
      className="text-center space-y-4"
      aria-label={`Step ${step.step}: ${step.title}`}
    >
      <div className="relative mx-auto w-fit">
        <div
          className={`w-20 h-20 ${step.color} rounded-2xl flex items-center justify-center mx-auto shadow-lg`}
        >
          <Icon className="w-10 h-10 text-white" aria-hidden="true" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full flex items-center justify-center text-sm font-bold ring-2 ring-white dark:ring-gray-900">
          {step.step}
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{step.title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm">{step.description}</p>
      </div>
    </motion.div>
  );
});
StepCard.displayName = 'StepCard';

export function HowToBecomeSection(): JSX.Element {
  return (
    <section
      className="py-12 lg:py-20 bg-white dark:bg-gray-900"
      aria-labelledby="how-to-become-instructor-title"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7 }}
          className="text-center space-y-4 mb-12 lg:mb-16"
        >
          <h2
            id="how-to-become-instructor-title"
            className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white"
          >
            How you&apos;ll become
          </h2>
          <h3 className="text-2xl lg:text-3xl font-bold text-primary/50 dark:text-primary/90">
            a successful instructor
          </h3>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((step, index) => (
            <StepCard step={step} index={index} key={step.step} />
          ))}
        </div>
      </div>
    </section>
  );
}
