'use client';

import { useMemo } from 'react';
import { Section } from '../_/curriculum-schema';

interface ContentValidationResult {
  isValid: boolean;
  completionScore: number;
  issues: {
    type: 'error' | 'warning' | 'suggestion';
    message: string;
    location?: string;
  }[];
  stats: {
    totalSections: number;
    totalLessons: number;
    totalContent: number;
    totalDuration: number;
    publishedContent: number;
    uploadsComplete: boolean;
  };
}

export const useContentValidation = (sections: Section[]): ContentValidationResult => {
  return useMemo(() => {
    const issues: ContentValidationResult['issues'] = [];
    let completionScore = 0;

    // Calculate stats
    const stats = {
      totalSections: sections.length,
      totalLessons: sections.reduce((sum, s) => sum + s.lessons.length, 0),
      totalContent: sections.reduce(
        (sum, s) => sum + s.lessons.reduce((lSum, l) => lSum + l.content.length, 0),
        0
      ),
      totalDuration: sections.reduce(
        (sum, s) =>
          sum +
          s.lessons.reduce(
            (lSum, l) => lSum + l.content.reduce((cSum, c) => cSum + (c.duration || 0), 0),
            0
          ),
        0
      ),
      publishedContent: 0,
      uploadsComplete: true,
    };

    // Validate sections
    if (sections.length === 0) {
      issues.push({
        type: 'error',
        message: 'At least one section is required',
      });
    } else {
      completionScore += 20;
    }

    sections.forEach((section, sectionIndex) => {
      const sectionLocation = `Section ${sectionIndex + 1}`;

      // Section validation
      if (!section.name?.trim()) {
        issues.push({
          type: 'error',
          message: 'Section name is required',
          location: sectionLocation,
        });
      }

      if (section.lessons.length === 0) {
        issues.push({
          type: 'error',
          message: 'At least one lesson is required',
          location: sectionLocation,
        });
      }

      if (!section.description?.trim()) {
        issues.push({
          type: 'suggestion',
          message: 'Consider adding a section description',
          location: sectionLocation,
        });
      }

      // Lesson validation
      section.lessons.forEach((lesson, lessonIndex) => {
        const lessonLocation = `${sectionLocation} > Lesson ${lessonIndex + 1}`;

        if (!lesson.name?.trim()) {
          issues.push({
            type: 'error',
            message: 'Lesson name is required',
            location: lessonLocation,
          });
        }

        if (lesson.content.length === 0) {
          issues.push({
            type: 'warning',
            message: 'Lesson has no content',
            location: lessonLocation,
          });
        }

        if (!lesson.description?.trim()) {
          issues.push({
            type: 'suggestion',
            message: 'Consider adding a lesson description',
            location: lessonLocation,
          });
        }

        if (lesson.learningObjectives.length === 0) {
          issues.push({
            type: 'suggestion',
            message: 'Consider adding learning objectives',
            location: lessonLocation,
          });
        }

        if (lesson.isPublished) {
          stats.publishedContent++;
        }

        // Content validation
        lesson.content.forEach((content, contentIndex) => {
          const contentLocation = `${lessonLocation} > Content ${contentIndex + 1}`;

          if (!content.title?.trim()) {
            issues.push({
              type: 'error',
              message: 'Content title is required',
              location: contentLocation,
            });
          }

          // File upload validation
          content.files.forEach((file, _fileIndex) => {
            if (file.s3Upload?.status === 'uploading' || file.s3Upload?.status === 'processing') {
              stats.uploadsComplete = false;
            }

            if (file.s3Upload?.status === 'failed') {
              issues.push({
                type: 'error',
                message: `File upload failed: ${file.name}`,
                location: contentLocation,
              });
            }
          });

          // Content-specific validation
          if (content.type === 'video' && !content.url && content.files.length === 0) {
            issues.push({
              type: 'warning',
              message: 'Video content has no video file or URL',
              location: contentLocation,
            });
          }

          if (content.type === 'link' && !content.url?.trim()) {
            issues.push({
              type: 'error',
              message: 'External link URL is required',
              location: contentLocation,
            });
          }

          if (content.type === 'quiz' && content.quiz && content.quiz.questions.length === 0) {
            issues.push({
              type: 'error',
              message: 'Quiz has no questions',
              location: contentLocation,
            });
          }
        });
      });
    });

    // Completion scoring
    if (stats.totalLessons >= 3) completionScore += 20;
    if (stats.totalContent >= 5) completionScore += 20;
    if (stats.totalDuration >= 1800) completionScore += 15; // 30 minutes
    if (stats.uploadsComplete) completionScore += 15;
    if (issues.filter((i) => i.type === 'error').length === 0) completionScore += 10;

    // Quality suggestions
    if (stats.totalDuration < 1800) {
      issues.push({
        type: 'suggestion',
        message: 'Consider adding more content to reach at least 30 minutes',
      });
    }

    if (stats.totalLessons < 5) {
      issues.push({
        type: 'suggestion',
        message: 'Consider adding more lessons for comprehensive coverage',
      });
    }

    const hasQuizzes = sections.some(
      (s) => s.quiz || s.lessons.some((l) => l.content.some((c) => c.type === 'quiz'))
    );

    if (!hasQuizzes) {
      issues.push({
        type: 'suggestion',
        message: 'Consider adding quizzes to assess student understanding',
      });
    }

    return {
      isValid: issues.filter((i) => i.type === 'error').length === 0 && stats.uploadsComplete,
      completionScore: Math.min(100, completionScore),
      issues,
      stats,
    };
  }, [sections]);
};
