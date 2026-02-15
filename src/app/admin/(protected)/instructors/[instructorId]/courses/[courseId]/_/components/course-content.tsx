'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlayCircle, FileText, Clock, BookOpen, Video, CheckCircle2 } from 'lucide-react';
import MarkdownRenderer from '@/app/(common)/courses/[slug]/_/components/markdown-renderer';
import { useCourseById } from '@/states/server/course/use-courses';

/**
 * Admin Instructor Course Detail Page:
 * This component lists all course details for the instructor in an admin view.
 * No student or user-progress logic is present!
 */

interface CourseContentProps {
  courseId: string;
}

function getLessonIcon(type?: string) {
  switch (type) {
    case 'video':
      return <Video className="h-4 w-4" />;
    case 'text':
      return <FileText className="h-4 w-4" />;
    case 'assignment':
      return <BookOpen className="h-4 w-4" />;
    case 'quiz':
      return <CheckCircle2 className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
}

export function CourseContent({ courseId }: CourseContentProps) {
  const { data: course, isLoading } = useCourseById(courseId);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center p-10">
        <span className="text-muted-foreground">Loading course details...</span>
      </div>
    );
  }
  if (!course) {
    return (
      <div className="w-full flex justify-center items-center p-10">
        <span className="text-destructive">Course not found.</span>
      </div>
    );
  }

  // Calculate totals for sections, lessons, and estimated duration
  const sectionCount = Array.isArray(course.sections) ? course.sections.length : 0;
  const totalLessons =
    Array.isArray(course.sections) && course.sections.length > 0
      ? course.sections.reduce(
          (sum, sec) => sum + (Array.isArray(sec.lessons) ? sec.lessons.length : 0),
          0
        )
      : 0;
  const totalDuration =
    Array.isArray(course.sections) && course.sections.length > 0
      ? course.sections.reduce(
          (sectionSum, sec) =>
            sectionSum +
            (Array.isArray(sec.lessons)
              ? sec.lessons.reduce(
                  (lessonSum, lesson) => lessonSum + (lesson.estimatedDuration ?? 0),
                  0
                )
              : 0),
          0
        )
      : 0;

  return (
    <div className="space-y-8">
      {/* Admin Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Course Information Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <BookOpen className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Sections</p>
                <p className="text-xl font-bold">{sectionCount}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <PlayCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Lessons</p>
                <p className="text-xl font-bold">{totalLessons}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Est. Duration</p>
                <p className="text-xl font-bold">
                  {Math.floor(totalDuration / 60)}h{' · '}
                  {totalDuration % 60}m
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Details Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="curriculum" className="w-full">
            <TabsList>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
            </TabsList>

            {/* Curriculum Section */}
            <TabsContent value="curriculum" className="space-y-6 mt-6">
              {!course.sections?.length ? (
                <div className="text-muted-foreground text-center py-4">
                  <span>No sections/lessons found for this course.</span>
                </div>
              ) : (
                course.sections.map((section, sectionIdx) => {
                  const sectionDuration = Array.isArray(section.lessons)
                    ? section.lessons.reduce((sum, l) => sum + (l.estimatedDuration ?? 0), 0)
                    : 0;
                  return (
                    <div key={section.id} className="border rounded-lg p-4">
                      <div className="mb-2">
                        <h4 className="font-semibold text-lg">
                          Section {sectionIdx + 1}:{' '}
                          <span className="font-normal">{section.title}</span>
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {Array.isArray(section.lessons) ? section.lessons.length : 0} lessons •{' '}
                          {Math.floor(sectionDuration / 60)}h{' · '}
                          {sectionDuration % 60}m
                        </p>
                        {section.description && (
                          <p className="text-muted-foreground text-xs mt-1">
                            {section.description}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2 mt-4">
                        {section.lessons && section.lessons.length > 0 ? (
                          section.lessons.map((lesson, lessonIdx) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between p-3 rounded-md border bg-gray-50 dark:bg-gray-800"
                            >
                              <div className="flex items-center space-x-3">
                                <span className="p-1 rounded text-gray-400 flex items-center">
                                  {getLessonIcon(lesson.contentType)}
                                </span>
                                <div>
                                  <div className="font-medium">
                                    {sectionIdx + 1}.{lessonIdx + 1} {lesson.title}
                                  </div>
                                  {!!lesson.description && (
                                    <div className="text-sm text-muted-foreground">
                                      {lesson.description}
                                    </div>
                                  )}
                                  {/* {'resources' in lesson &&
                                    Array.isArray((lesson as any).resources) &&
                                    (lesson as any).resources.length > 0 && (
                                      <div className="flex items-center gap-2 mt-1">
                                        <Download className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">
                                          {(lesson as any).resources.length} resource(s)
                                        </span>
                                      </div>
                                    )} */}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {lesson.contentType && (
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {lesson.contentType}
                                  </Badge>
                                )}
                                {typeof lesson.estimatedDuration === 'number' && (
                                  <span className="text-sm text-muted-foreground">
                                    {lesson.estimatedDuration}min
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-muted-foreground px-2">
                            No lessons in this section.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </TabsContent>

            {/* Description Section */}
            <TabsContent value="description" className="mt-6">
              <div className="prose dark:prose-invert max-w-none">
                <MarkdownRenderer
                  markdown={
                    course.description ||
                    '## Course Description\n\nNo course description has been provided.'
                  }
                />
              </div>
            </TabsContent>

            {/* Requirements Section */}
            <TabsContent value="requirements" className="mt-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Prerequisites</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {course.requirements && course.requirements.length > 0 ? (
                      course.requirements.map((item: string, i: number) => <li key={i}>{item}</li>)
                    ) : (
                      <>
                        <li>Basic knowledge of JavaScript (ES6+)</li>
                        <li>Familiarity with React fundamentals</li>
                        <li>Understanding of HTML and CSS</li>
                        <li>Experience with Node.js and npm</li>
                      </>
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Learning Outcomes</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {course.learningOutcomes && course.learningOutcomes.length > 0 ? (
                      course.learningOutcomes.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))
                    ) : (
                      <>
                        <li>Build modern React applications</li>
                        <li>Apply best practices for maintainable code</li>
                        <li>Integrate with Node.js ecosystems</li>
                        <li>Test and deploy to production</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
