'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  PlayCircle,
  HelpCircle,
  Award,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Users,
  Star,
  DollarSign,
  Target,
  ListChecks,
  UserCheck,
  Tag,
  Globe,
  GraduationCap,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Course } from '@/types/course';

interface CourseDetailProps {
  course: Course;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  delay?: number;
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  bgColor,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
            <div className={cn('p-3 rounded-lg', bgColor)}>
              <Icon className={cn('w-6 h-6', color)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function CourseDetail({ course }: CourseDetailProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const stats = useMemo(() => {
    const totalLessons = course.sections.reduce((sum, s) => sum + s.lessons.length, 0);
    const totalQuizzes = course.sections.reduce((sum, s) => sum + (s.quiz ? 1 : 0), 0);
    const publishedSections = course.sections.filter((s) => s.isPublished).length;
    const publishedLessons = course.sections.reduce(
      (sum, s) => sum + s.lessons.filter((l) => l.isPublished).length,
      0
    );
    const completionRate =
      totalLessons > 0 ? Math.round((publishedLessons / totalLessons) * 100) : 0;

    return { totalLessons, totalQuizzes, publishedSections, publishedLessons, completionRate };
  }, [course.sections]);

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
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const qualityChecks = useMemo(
    () => [
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
    ],
    [course.sections, stats]
  );

  const completedChecks = qualityChecks.filter((c) => c.completed).length;

  return (
    <div className="space-y-8">
      {/*  Overview Stats  */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={course.students?.toLocaleString() ?? '0'}
          subtitle="Enrolled"
          icon={Users}
          color="text-blue-600"
          bgColor="bg-blue-100 dark:bg-blue-900/20"
          delay={0}
        />
        <StatCard
          title="Rating"
          value={course.rating > 0 ? course.rating.toFixed(1) : '—'}
          subtitle={course.totalRatings > 0 ? `${course.totalRatings} reviews` : 'No reviews yet'}
          icon={Star}
          color="text-amber-500"
          bgColor="bg-amber-100 dark:bg-amber-900/20"
          delay={0.05}
        />
        <StatCard
          title="Price"
          value={course.price > 0 ? `${course.currency ?? '$'}${course.price}` : 'Free'}
          subtitle={
            course.discountPrice > 0 && course.discountPrice < course.price
              ? `Discount: ${course.currency ?? '$'}${course.discountPrice}`
              : undefined
          }
          icon={DollarSign}
          color="text-emerald-600"
          bgColor="bg-emerald-100 dark:bg-emerald-900/20"
          delay={0.1}
        />
        <StatCard
          title="Content"
          value={`${course.sections.length} sections`}
          subtitle={`${stats.totalLessons} lessons · ${stats.totalQuizzes} quizzes`}
          icon={BookOpen}
          color="text-violet-600"
          bgColor="bg-violet-100 dark:bg-violet-900/20"
          delay={0.15}
        />
      </div>

      {/*  Course Info Grid  */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About This Course</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Learning Outcomes */}
            {course.learningOutcomes?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-emerald-500" />
                  Learning Outcomes
                </h4>
                <ul className="space-y-2">
                  {course.learningOutcomes.map((outcome, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {course.requirements?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <ListChecks className="w-4 h-4 text-amber-500" />
                  Requirements
                </h4>
                <ul className="space-y-2">
                  {course.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Target Audience */}
            {course.targetAudience?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <UserCheck className="w-4 h-4 text-blue-500" />
                  Target Audience
                </h4>
                <ul className="space-y-2">
                  {course.targetAudience.map((audience, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <span>{audience}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Empty state if no about data */}
            {!course.learningOutcomes?.length &&
              !course.requirements?.length &&
              !course.targetAudience?.length && (
                <p className="text-sm text-muted-foreground italic">
                  No learning outcomes, requirements, or target audience defined yet.
                </p>
              )}
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Course Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <DetailItem
                icon={GraduationCap}
                label="Level"
                value={
                  course.level ? course.level.charAt(0).toUpperCase() + course.level.slice(1) : '—'
                }
              />
              <DetailItem icon={Globe} label="Language" value={course.language || '—'} />
              <DetailItem
                icon={Globe}
                label="Subtitle Language"
                value={course.subtitleLanguage || '—'}
              />
              <DetailItem
                icon={Clock}
                label="Duration"
                value={
                  course.durationValue
                    ? `${course.durationValue} ${course.durationUnit || 'hours'}`
                    : '—'
                }
              />
              <DetailItem
                icon={Award}
                label="Certificate"
                value={(course.certificate ?? true) ? 'Yes' : 'No'}
                valueClass={
                  (course.certificate ?? true)
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : undefined
                }
              />
              <DetailItem
                icon={BookOpen}
                label="Published Content"
                value={`${stats.publishedSections}/${course.sections.length} sections`}
              />
            </div>

            {/* Topics */}
            {course.topics?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-violet-500" />
                  Topics
                </h4>
                <div className="flex flex-wrap gap-2">
                  {course.topics.map((topic, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Content Readiness */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Content Readiness</h4>
              <div className="flex items-center gap-3">
                <Progress value={stats.completionRate} className="h-2 flex-1" />
                <span className="text-sm font-medium text-foreground">{stats.completionRate}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.publishedLessons}/{stats.totalLessons} lessons published
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/*  Course Curriculum  */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Course Curriculum</CardTitle>
        </CardHeader>
        <CardContent>
          {course.sections.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No sections added yet. Start building your curriculum.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {course.sections.map((section, sectionIndex) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sectionIndex * 0.05 }}
                  className="border rounded-lg overflow-hidden"
                >
                  {/* Section Header */}
                  <button
                    type="button"
                    className="flex items-center justify-between w-full p-4 bg-muted/40 hover:bg-muted/60 transition-colors text-left"
                    onClick={() => toggleSection(section.id)}
                    aria-expanded={expandedSections.has(section.id)}
                    aria-controls={`section-content-${section.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                        {sectionIndex + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{section.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {section.lessons.length} lessons
                          {section.quiz && ' · 1 quiz'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={section.isPublished ? 'default' : 'secondary'}>
                        {section.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 text-muted-foreground transition-transform',
                          expandedSections.has(section.id) && 'rotate-180'
                        )}
                      />
                    </div>
                  </button>

                  {/* Section Content */}
                  <AnimatePresence>
                    {expandedSections.has(section.id) && (
                      <motion.div
                        id={`section-content-${section.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t bg-background"
                      >
                        <div className="p-4 space-y-2">
                          {section.lessons.map((lesson, lessonIndex) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                    {lessonIndex + 1}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm">{lesson.title}</h4>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    {lesson.estimatedDuration && (
                                      <span>{formatDuration(lesson.estimatedDuration)}</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <div
                                  className="w-5 h-5 bg-muted rounded flex items-center justify-center"
                                  title={lesson.contentType}
                                >
                                  {getContentTypeIcon(lesson.contentType)}
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
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/*  Content Quality Check  */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Content Quality Check</CardTitle>
            <Badge variant={completedChecks === qualityChecks.length ? 'default' : 'secondary'}>
              {completedChecks}/{qualityChecks.length} passed
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {qualityChecks.map((check, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg border',
                  check.completed
                    ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50'
                    : check.required
                      ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50'
                      : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/50'
                )}
              >
                <div className="flex items-center gap-3">
                  {check.completed ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertCircle
                      className={cn('w-5 h-5', check.required ? 'text-red-600' : 'text-amber-600')}
                    />
                  )}
                  <span
                    className={cn(
                      'font-medium text-sm',
                      check.completed
                        ? 'text-emerald-800 dark:text-emerald-200'
                        : check.required
                          ? 'text-red-800 dark:text-red-200'
                          : 'text-amber-800 dark:text-amber-200'
                    )}
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

function DetailItem({
  icon: Icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn('text-sm font-medium text-foreground', valueClass)}>{value}</p>
      </div>
    </div>
  );
}
