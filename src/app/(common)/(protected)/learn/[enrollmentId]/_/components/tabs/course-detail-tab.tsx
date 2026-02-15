'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, BookOpen, ListChecks } from 'lucide-react';
import type { EnrollmentDetail } from '@/types/enrollment/enrollment.type';

interface CourseDetailsTabProps {
  enrollment: EnrollmentDetail;
}

export function CourseDetailsTab({ enrollment }: CourseDetailsTabProps) {
  const totalLessons = enrollment.sections.reduce(
    (acc, section) => acc + section.lessons.length,
    0
  );
  const totalQuizzes = enrollment.sections.filter((s) => s.quiz).length;

  return (
    <div className="space-y-6">
      {/* Enrollment Info */}
      <Card>
        <CardHeader>
          <CardTitle>Enrollment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoItem
              icon={<Calendar className="h-5 w-5 text-muted-foreground" />}
              label="Enrolled On"
              value={new Date(enrollment.enrolledAt).toLocaleDateString()}
            />
            <InfoItem
              icon={<BookOpen className="h-5 w-5 text-muted-foreground" />}
              label="Lessons"
              value={totalLessons.toString()}
            />
            <InfoItem
              icon={<ListChecks className="h-5 w-5 text-muted-foreground" />}
              label="Quizzes"
              value={totalQuizzes.toString()}
            />
            <InfoItem
              icon={<Clock className="h-5 w-5 text-muted-foreground" />}
              label="Status"
              value={
                <Badge
                  variant={
                    enrollment.status === 'COMPLETED'
                      ? 'default'
                      : enrollment.status === 'ACTIVE'
                        ? 'secondary'
                        : 'destructive'
                  }
                >
                  {enrollment.status}
                </Badge>
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Course Structure Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Course Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {enrollment.sections.map((section, index) => (
              <div
                key={section.id}
                className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">
                      Section {index + 1}: {section.title}
                    </h4>
                    {section.description && (
                      <p className="text-sm text-muted-foreground">{section.description}</p>
                    )}
                  </div>
                  {/* <Badge variant={section.isPublished ? 'default' : 'secondary'}>
                    {section.isPublished ? 'Published' : 'Draft'}
                  </Badge> */}
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {section.lessons.length} {section.lessons.length === 1 ? 'lesson' : 'lessons'}
                  </span>
                  {section.quiz && (
                    <span className="flex items-center gap-1">
                      <ListChecks className="h-4 w-4" />
                      Quiz included
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
