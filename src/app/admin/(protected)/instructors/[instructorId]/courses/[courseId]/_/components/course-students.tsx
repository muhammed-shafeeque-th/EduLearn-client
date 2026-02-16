'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users, Search, MessageSquare, Award, Clock, TrendingUp } from 'lucide-react';

interface CourseStudentsProps {
  courseId: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  enrolledAt: string;
  progress: number;
  lastActive: string;
  status: 'active' | 'inactive' | 'completed';
  totalTimeSpent: number;
  assignmentsCompleted: number;
  totalAssignments: number;
}

export async function CourseStudents({}: CourseStudentsProps) {
  // const studentsData = await getCourseStudents(courseId);

  const mockStudents: Student[] = [
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice.j@email.com',
      avatar: '/avatars/student1.png',
      enrolledAt: '2024-06-15',
      progress: 85,
      lastActive: '2024-07-28',
      status: 'active',
      totalTimeSpent: 450,
      assignmentsCompleted: 8,
      totalAssignments: 10,
    },
    {
      id: '2',
      name: 'Bob Smith',
      email: 'bob.smith@email.com',
      avatar: '/avatars/student2.png',
      enrolledAt: '2024-06-20',
      progress: 92,
      lastActive: '2024-07-29',
      status: 'active',
      totalTimeSpent: 520,
      assignmentsCompleted: 9,
      totalAssignments: 10,
    },
    {
      id: '3',
      name: 'Carol Davis',
      email: 'carol.d@email.com',
      avatar: '/avatars/student3.png',
      enrolledAt: '2024-05-10',
      progress: 100,
      lastActive: '2024-07-25',
      status: 'completed',
      totalTimeSpent: 680,
      assignmentsCompleted: 10,
      totalAssignments: 10,
    },
    {
      id: '4',
      name: 'David Wilson',
      email: 'david.w@email.com',
      avatar: '/avatars/student4.png',
      enrolledAt: '2024-07-01',
      progress: 45,
      lastActive: '2024-07-20',
      status: 'inactive',
      totalTimeSpent: 180,
      assignmentsCompleted: 4,
      totalAssignments: 10,
    },
  ];

  const getStatusBadge = (status: Student['status']) => {
    // const variants = {
    //   active: 'default',
    //   inactive: 'secondary',
    //   completed: 'outline',
    // } as const;

    const colors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const averageProgress =
    mockStudents.reduce((acc, student) => acc + student.progress, 0) / mockStudents.length;
  const activeStudents = mockStudents.filter((s) => s.status === 'active').length;
  const completedStudents = mockStudents.filter((s) => s.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Students Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Student Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-xl font-bold">{mockStudents.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Students</p>
                <p className="text-xl font-bold">{activeStudents}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Award className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-xl font-bold">{completedStudents}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
                <p className="text-xl font-bold">{Math.round(averageProgress)}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Enrolled Students</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search students..." className="pl-10 w-64" />
              </div>
              <Button variant="outline" size="sm">
                Export List
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Time Spent</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={student.avatar} alt={student.name} />
                          <AvatarFallback>
                            {student.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-muted-foreground">{student.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2 w-32">
                        <div className="flex justify-between text-sm">
                          <span>{student.progress}%</span>
                          <span className="text-muted-foreground">
                            {student.assignmentsCompleted}/{student.totalAssignments}
                          </span>
                        </div>
                        <Progress value={student.progress} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(student.lastActive).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {Math.floor(student.totalTimeSpent / 60)}h {student.totalTimeSpent % 60}m
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
