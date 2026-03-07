'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { UserPlus, BookOpen, Star, AlertCircle, TrendingUp } from 'lucide-react';

interface Activity {
  id: string;
  type: 'user_joined' | 'course_created' | 'review_posted' | 'issue_reported' | 'milestone_reached';
  title: string;
  description: string;
  user: {
    name: string;
    avatar?: string;
  };
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
}

export function RecentActivity() {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      await new Promise((resolve) => setTimeout(resolve, 2400));
      setActivities([
        {
          id: '1',
          type: 'user_joined',
          title: 'New User Registration',
          description: 'Sarah Johnson joined as a student',
          user: { name: 'Sarah Johnson', avatar: '/avatars/sarah.png' },
          timestamp: '2 minutes ago',
          priority: 'low',
        },
        {
          id: '2',
          type: 'course_created',
          title: 'New Course Published',
          description: 'Advanced React Development course is now live',
          user: { name: 'Dr. Mike Chen', avatar: '/avatars/mike.png' },
          timestamp: '15 minutes ago',
          priority: 'medium',
        },
        {
          id: '3',
          type: 'review_posted',
          title: 'New 5-Star Review',
          description: 'JavaScript Fundamentals received excellent feedback',
          user: { name: 'Alex Thompson', avatar: '/avatars/alex.png' },
          timestamp: '1 hour ago',
          priority: 'low',
        },
        {
          id: '4',
          type: 'issue_reported',
          title: 'Technical Issue Reported',
          description: 'Video playback issue in Mobile Development course',
          user: { name: 'Lisa Wang', avatar: '/avatars/lisa.png' },
          timestamp: '2 hours ago',
          priority: 'high',
        },
        {
          id: '5',
          type: 'milestone_reached',
          title: 'Milestone Achieved',
          description: 'Platform reached 2,500 total users!',
          user: { name: 'System', avatar: '/avatars/system.png' },
          timestamp: '3 hours ago',
          priority: 'medium',
        },
      ]);
      setLoading(false);
    };

    fetchActivities();
  }, []);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'user_joined':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'course_created':
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'review_posted':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'issue_reported':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'milestone_reached':
        return <TrendingUp className="h-4 w-4 text-purple-500" />;
      default:
        return <div className="h-4 w-4 bg-gray-300 rounded-full" />;
    }
  };

  const getPriorityBadge = (priority: Activity['priority']) => {
    const variants = {
      high: 'destructive',
      medium: 'default',
      low: 'secondary',
    } as const;

    return (
      <Badge variant={variants[priority]} className="text-xs">
        {priority}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates and activities across the platform</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    {getPriorityBadge(activity.priority)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                      <AvatarFallback className="text-xs">
                        {activity.user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {activity.user.name} · {activity.timestamp}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
