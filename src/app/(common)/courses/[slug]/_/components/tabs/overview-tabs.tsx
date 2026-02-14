'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Target, BookOpen } from 'lucide-react';
import { Course } from '@/types/course';
import MarkdownRenderer from '../markdown-renderer';

interface OverviewTabProps {
  course: Course;
}

export function OverviewTab({ course }: OverviewTabProps) {
  // Memoize sections to avoid unnecessary recalculation
  const sections = useMemo(
    () => [
      {
        title: "What you'll learn",
        icon: CheckCircle,
        items: Array.isArray(course.learningOutcomes) ? course.learningOutcomes : [],
        iconColor: 'text-green-600',
      },
      {
        title: 'Requirements',
        icon: BookOpen,
        items: Array.isArray(course.requirements) ? course.requirements : [],
        iconColor: 'text-blue-600',
      },
      {
        title: 'Who this course is for',
        icon: Target,
        items: Array.isArray(course.targetAudience) ? course.targetAudience : [],
        iconColor: 'text-purple-600',
      },
    ],
    [course.learningOutcomes, course.requirements, course.targetAudience]
  );

  const hasDescription =
    typeof course.description === 'string' && course.description.trim().length > 0;
  const hasTopics = Array.isArray(course.topics) && course.topics.length > 0;

  return (
    <div className="space-y-8">
      {/* Description */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        aria-labelledby="course-description-title"
      >
        <h2
          id="course-description-title"
          className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
        >
          Description
        </h2>
        <div className="[&_.prose]:max-w-none [&_.prose]:prose [&_.prose]:prose-neutral [&_.prose]:dark:prose-invert">
          {hasDescription ? (
            <MarkdownRenderer
              markdown={course.description}
              className="prose prose-neutral dark:prose-invert max-w-none"
            />
          ) : (
            <p className="text-gray-600 dark:text-gray-300 italic">No description provided.</p>
          )}
        </div>
      </motion.section>

      {/* Course Features Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sections.map((section, sectionIdx) => (
          <motion.section
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: sectionIdx * 0.1 }}
            aria-labelledby={`overview-section-${sectionIdx}`}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle
                  className="flex items-center gap-2"
                  id={`overview-section-${sectionIdx}`}
                >
                  <section.icon className={`w-5 h-5 ${section.iconColor}`} aria-hidden="true" />
                  <span>{section.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {section.items && section.items.length > 0 ? (
                  <ul className="space-y-3">
                    {section.items.map((item, itemIdx) => (
                      <motion.li
                        key={itemIdx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: sectionIdx * 0.1 + itemIdx * 0.05,
                        }}
                        className="flex items-start gap-3"
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${section.iconColor.replace('text-', 'bg-')} mt-2 flex-shrink-0`}
                          aria-hidden="true"
                        />
                        <span className="text-gray-600 dark:text-gray-300 text-sm">
                          {typeof item === 'string' && item.trim() ? (
                            item
                          ) : (
                            <span className="italic text-gray-400">No detail provided.</span>
                          )}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic text-sm">
                    No items specified.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.section>
        ))}
      </div>

      {/* Topics/Tags */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        aria-labelledby="course-topics-title"
      >
        <h3
          id="course-topics-title"
          className="text-lg font-semibold text-gray-900 dark:text-white mb-3"
        >
          Tags
        </h3>
        <div className="flex flex-wrap gap-2">
          {hasTopics ? (
            course.topics.map((topic, idx) => (
              <Badge
                key={topic || idx}
                variant="secondary"
                className="bg-primary/10 hover:bg-primary/80 hover:text-white text-primary transition-colors cursor-pointer"
                tabIndex={0}
                aria-label={`Course tag: ${topic}`}
              >
                {topic}
              </Badge>
            ))
          ) : (
            <span className="text-gray-500 dark:text-gray-400 italic text-sm">No tags listed.</span>
          )}
        </div>
      </motion.section>
    </div>
  );
}
