'use client';

import { ArrowLeft, Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Instructor } from '@/types/user';

interface CoursesHeaderProps {
  instructor: Instructor;
}

export function CoursesHeader({ instructor }: CoursesHeaderProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="h-8 w-8 p-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm text-muted-foreground">
          <span>Instructors</span> / <span>{instructor.username}</span> /{' '}
          <span className="text-foreground">Courses</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={instructor.avatar} alt={instructor.username} />
            <AvatarFallback>
              {instructor.username
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{instructor.username}&apos;s Courses</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{instructor.instructorProfile?.expertise}</Badge>
              <span className="text-sm text-muted-foreground">
                {instructor.instructorProfile?.totalCourses} courses •{' '}
                {instructor.instructorProfile?.totalStudents} students
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Course
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
