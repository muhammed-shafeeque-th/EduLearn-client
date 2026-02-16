'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Mail,
  Calendar,
  Star,
  BookOpen,
  Users,
  Award,
  // MessageSquare,
  // ExternalLink,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import MarkdownRenderer from '@/app/(common)/courses/[slug]/_/components/markdown-renderer';
import { Instructor } from '@/types/user';
import { formatDate } from '@/lib/utils';
import { useAdminUser } from '@/states/server/admin/use-admin-users';
import { InstructorSettings } from './instructor-settings';

interface InstructorProfileProps {
  instructor: Instructor;
}

function getStatusBadge(status: Instructor['status']) {
  const variants: Record<Instructor['status'], string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    verified: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    'not-active': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    'not-verified': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    blocked: 'bg-yellow-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${variants[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export function InstructorProfile({ instructor: instr }: InstructorProfileProps) {
  const router = useRouter();
  const { user } = useAdminUser(instr.id);

  const instructor = (user as Instructor) ?? instr;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/admin/instructors')}
          className="h-8 w-8 p-0"
          aria-label="Back to Instructors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm text-muted-foreground">
          <span>Instructors</span> / <span className="text-foreground">{instructor.username}</span>
        </div>
      </div>

      {/* Main Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={instructor.avatar} alt={instructor.username} />
              <AvatarFallback className="text-2xl">
                {instructor.username
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-3xl font-bold">{instructor.username}</h1>
                {instructor.instructorProfile?.headline && (
                  <p className="text-lg text-muted-foreground mt-1">
                    {instructor.instructorProfile?.headline}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center text-muted-foreground">
                  <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
                  {instructor.email}
                </div>
                {instructor.instructorProfile?.expertise && (
                  <Badge variant="outline" className="text-sm">
                    {instructor.instructorProfile.expertise}
                  </Badge>
                )}
                {getStatusBadge(instructor.status)}
              </div>

              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                  <span className="font-medium">
                    {instructor.instructorProfile?.rating?.toFixed(1) ?? 'N/A'}
                  </span>
                  <span className="text-muted-foreground">
                    ({Math.floor(Math.random() * 500 + 100)} reviews)
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span>
                    Joined{' '}
                    {instructor.instructorProfile?.joinedAt
                      ? formatDate(new Date(instructor.instructorProfile.joinedAt))
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <BookOpen className="h-10 w-10 text-blue-500" aria-hidden="true" />
              <div>
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <p className="text-2xl font-bold">
                  {instructor.instructorProfile?.totalCourses ?? 0}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Users className="h-10 w-10 text-green-500" aria-hidden="true" />
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">
                  {instructor.instructorProfile?.totalStudents?.toLocaleString() ?? 0}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <Award className="h-10 w-10 text-yellow-500" aria-hidden="true" />
              <div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold">
                  {instructor.instructorProfile?.rating?.toFixed(1) ?? 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Calendar className="h-10 w-10 text-purple-500" aria-hidden="true" />
              <div>
                <p className="text-sm text-muted-foreground">Experience</p>
                <p className="text-lg font-bold">
                  {instructor.instructorProfile?.experience ?? 'N/A'}
                  {/* {calculateExperience(instructor.instructorProfile.joinedAt)} */}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Bio Section */}
          {instructor.instructorProfile?.bio && (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                About {instructor.username.split(' ')[0]}
              </h3>
              <div className="prose dark:prose-invert max-w-none">
                <MarkdownRenderer markdown={instructor.instructorProfile.bio} />
              </div>
            </div>
          )}

          <Separator />

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Professional Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Specialization:</span>
                  <span className="font-medium">
                    {instructor.instructorProfile?.expertise ?? 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member since:</span>
                  <span className="font-medium">
                    {instructor.instructorProfile?.joinedAt
                      ? formatDate(new Date(instructor.instructorProfile.joinedAt))
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last active:</span>
                  <span className="font-medium">
                    {instructor.lastLoginAt ? formatDate(new Date(instructor.lastLoginAt)) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account status:</span>
                  <span className="font-medium">{instructor.status}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Performance Metrics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Course completion rate:</span>
                  <span className="font-medium">{Math.floor(Math.random() * 20 + 75)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Response time:</span>
                  <span className="font-medium">&lt; 2 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student satisfaction:</span>
                  <span className="font-medium">{Math.floor(Math.random() * 10 + 85)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Revenue generated:</span>
                  <span className="font-medium">
                    ${Math.floor(Math.random() * 50000 + 25000).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/instructors/${instructor.id}/courses`)}
              aria-label="Manage Courses"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Manage Courses
            </Button>
            {/* <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              View Students
            </Button>
            <Button variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              Send Message
            </Button>
            <Button variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              Public Profile
            </Button> */}
            <InstructorSettings instructor={instructor} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
