'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookOpen, Star } from 'lucide-react';
import { Enrollment } from '@/types/enrollment';
import Image from 'next/image';

interface CourseCardProps {
  enrollment: Enrollment;
  onClick?: (enrollment: Enrollment) => void;
  viewMode?: 'grid' | 'list';
}

export function CourseCard({ enrollment, onClick, viewMode = 'grid' }: CourseCardProps) {
  const course = typeof enrollment.course === 'object' ? enrollment.course : null;

  if (!course) return null;

  const getStatusBadge = () => {
    switch (enrollment.status) {
      case 'COMPLETED':
        return <Badge variant="success">Completed</Badge>;
      case 'ACTIVE':
        return <Badge variant="default">In Progress</Badge>;
      case 'DROPPED':
        return <Badge variant="destructive">Dropped</Badge>;
      default:
        return null;
    }
  };

  const content = (
    <>
      <div className={viewMode === 'list' ? 'flex gap-4' : ''}>
        <div
          className={`relative ${viewMode === 'list' ? 'w-48 h-32 flex-shrink-0' : 'w-full h-48'} rounded-lg overflow-hidden bg-muted`}
        >
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-2 right-2">{getStatusBadge()}</div>
        </div>

        <div className={viewMode === 'list' ? 'flex-1' : ''}>
          <CardContent className={viewMode === 'list' ? 'p-0' : 'p-4'}>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg line-clamp-2 text-foreground mb-1">
                  {course.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={course.instructor.avatar} />
                    <AvatarFallback>
                      {course.instructor.name[0]}
                      {course.instructor.name[1]}
                    </AvatarFallback>
                  </Avatar>
                  <span>{course.instructor.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{course.rating || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{course.lessonsCount} lessons</span>
                </div>
                <Badge variant="secondary">{course.level}</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{enrollment.progress}%</span>
                </div>
                <Progress value={enrollment.progress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </div>
      </div>
    </>
  );

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={() => onClick?.(enrollment)}
    >
      {content}
    </Card>
  );
}
