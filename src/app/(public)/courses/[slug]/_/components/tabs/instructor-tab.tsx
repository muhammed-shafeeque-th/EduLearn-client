'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Users, BookOpen, Award, ExternalLink } from 'lucide-react';
import { Course } from '@/types/course';

interface InstructorTabProps {
  course: Course;
}

export function InstructorTab({ course }: InstructorTabProps) {
  const instructor = course.instructor;

  const stats = [
    {
      icon: Star,
      label: 'Instructor Rating',
      value: instructor.rating?.toString() ?? 1.5,
      color: 'text-yellow-600',
    },
    {
      icon: Award,
      label: 'Reviews',
      value: instructor.totalReviews?.toLocaleString() ?? 10,
      color: 'text-green-600',
    },
    {
      icon: Users,
      label: 'Students',
      value: instructor.totalStudents?.toLocaleString() ?? 10,
      color: 'text-blue-600',
    },
    {
      icon: BookOpen,
      label: 'Courses',
      value: instructor.totalCourses?.toString() ?? 5,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Instructor Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 mx-auto sm:mx-0">
                {instructor.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <CardTitle className="text-2xl mb-2">{instructor.name}</CardTitle>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">{instructor.title}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  <Badge
                    variant="secondary"
                    className=" bg-primary/10 hover:bg-primary/80 hover:text-white text-primary  transition-colors cursor-pointer"
                  >
                    UI/UX Design
                  </Badge>
                  <Badge
                    variant="secondary"
                    className=" bg-primary/10 hover:bg-primary/80 hover:text-white text-primary  transition-colors cursor-pointer"
                  >
                    Web Development
                  </Badge>
                  <Badge
                    variant="secondary"
                    className=" bg-primary/10 hover:bg-primary/80 hover:text-white text-primary  transition-colors cursor-pointer"
                  >
                    Figma Expert
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                About the Instructor
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{instructor?.bio}</p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-4">
                With a passion for creating beautiful and functional digital experiences, John has
                helped thousands of students master the art of web design. His courses focus on
                practical, real-world skills that students can immediately apply in their careers.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button variant="outline" className="flex-1">
                <Users className="w-4 h-4 mr-2" />
                View Profile
              </Button>
              <Button variant="outline" className="flex-1">
                <ExternalLink className="w-4 h-4 mr-2" />
                More Courses
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
