'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  PlayCircle,
  HelpCircle,
  Award,
  CheckCircle,
  AlertCircle,
  GripVertical,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Course } from '@/types/course';

interface CourseDetailProps {
  course: Course;
  onUpdate?: () => void;
}

export function CourseDetail({ course }: CourseDetailProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const calculateCourseStats = () => {
    const totalLessons = course.sections.reduce((sum, section) => sum + section.lessons.length, 0);

    const totalQuizzes = course.sections.reduce((sum, section) => {
      const sectionQuizzes = section.quiz ? 1 : 0;
      // const lessonQuizzes = section.lessons?.reduce(
      //   (lSum, lesson) => lSum + (lesson.quiz ? 1 : 0) + (lesson.?.type === 'quiz' ? 1 : 0),
      //   0
      // );
      return sum + sectionQuizzes;
    }, 0);

    const totalContent = course.sections.reduce((sum, section) => sum + section.lessons.length, 0);

    const publishedSections = course.sections.filter((s) => s.isPublished).length;
    const publishedLessons = course.sections.reduce(
      (sum, section) => sum + section.lessons.filter((l) => l.isPublished).length,
      0
    );

    return {
      totalLessons,
      totalQuizzes,
      totalContent,
      publishedSections,
      publishedLessons,
      completionRate: totalLessons > 0 ? Math.round((publishedLessons / totalLessons) * 100) : 0,
    };
  };

  const stats = calculateCourseStats();

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <PlayCircle className="w-4 h-4" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4" />;
      case 'document':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Course Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sections</p>
                <p className="text-xl font-bold">{course.sections?.length}</p>
                <p className="text-xs text-green-600">{stats.publishedSections} published</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <PlayCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lessons</p>
                <p className="text-xl font-bold">{stats.totalLessons}</p>
                <p className="text-xs text-green-600">{stats.publishedLessons} published</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <HelpCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quizzes</p>
                <p className="text-xl font-bold">{stats.totalQuizzes}</p>
                <p className="text-xs text-muted-foreground">Assessments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Award className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Complete</p>
                <p className="text-xl font-bold">{stats.completionRate}%</p>
                <Progress value={stats.completionRate} className="h-1 w-full mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Content Structure */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Course Curriculum</CardTitle>
            {/* <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Section
            </Button> */}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {course.sections.map((section, sectionIndex) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.1 }}
                className="border rounded-lg overflow-hidden"
              >
                {/* Section Header */}
                <button
                  type="button"
                  className="flex items-center justify-between w-full p-4 bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => toggleSection(section.id)}
                  tabIndex={0}
                  aria-expanded={expandedSections.has(section.id)}
                  aria-controls={`section-content-${section.id}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleSection(section.id);
                    }
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                      {sectionIndex + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{section.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {section.lessons.length} lessons
                        {section.quiz && ' • 1 quiz'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant={section.isPublished ? 'default' : 'secondary'}>
                      {section.isPublished ? 'Published' : 'Draft'}
                    </Badge>

                    <div className="flex items-center space-x-1">
                      {/* <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button> */}
                      <Button variant="ghost" size="sm">
                        <GripVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </button>

                {/* Section Content */}
                {expandedSections.has(section.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t bg-background"
                  >
                    <div className="p-4 space-y-3">
                      {section.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                {lessonIndex + 1}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">{lesson.title}</h4>
                              <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                                {lesson.estimatedDuration && (
                                  <span>{formatDuration(lesson.estimatedDuration)}</span>
                                )}
                                {/* {lesson.quiz && <span>• Quiz</span>} */}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              <div
                                key={lesson.title}
                                className="w-5 h-5 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center"
                                title={lesson.title}
                              >
                                {getContentTypeIcon(lesson.contentType)}
                              </div>
                              {lesson.contentType && (
                                <span className="text-xs text-muted-foreground">+{1}</span>
                              )}
                            </div>

                            <Badge
                              variant={lesson.isPublished ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {lesson.isPublished ? (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              ) : (
                                <AlertCircle className="w-3 h-3 mr-1" />
                              )}
                              {lesson.isPublished ? 'Live' : 'Draft'}
                            </Badge>

                            {/* <Button variant="ghost" size="sm">
                              <Edit className="w-3 h-3" />
                            </Button> */}
                          </div>
                        </div>
                      ))}

                      {/* Add Lesson Button */}
                      {/* <Button variant="outline" size="sm" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Lesson to {section.title}
                      </Button> */}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Quality Check */}
      <Card>
        <CardHeader>
          <CardTitle>Content Quality Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                label: 'Course has sections',
                completed: course.sections.length > 0,
                required: true,
              },
              {
                label: 'At least 3 lessons total',
                completed: stats.totalLessons >= 3,
                required: true,
              },
              {
                label: 'All sections have lessons',
                completed: course.sections.every((s) => s.lessons.length > 0),
                required: true,
              },
              {
                label: 'Course has assessments',
                completed: stats.totalQuizzes > 0,
                required: false,
              },
              {
                label: 'All content is published',
                completed: stats.completionRate === 100,
                required: false,
              },
            ].map((check, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  check.completed
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : check.required
                      ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                      : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {check.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle
                      className={`w-5 h-5 ${check.required ? 'text-red-600' : 'text-yellow-600'}`}
                    />
                  )}
                  <span
                    className={`font-medium ${
                      check.completed
                        ? 'text-green-800 dark:text-green-200'
                        : check.required
                          ? 'text-red-800 dark:text-red-200'
                          : 'text-yellow-800 dark:text-yellow-200'
                    }`}
                  >
                    {check.label}
                  </span>
                </div>
                <Badge
                  variant={
                    check.completed ? 'default' : check.required ? 'destructive' : 'secondary'
                  }
                >
                  {check.completed ? 'Complete' : check.required ? 'Required' : 'Optional'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
