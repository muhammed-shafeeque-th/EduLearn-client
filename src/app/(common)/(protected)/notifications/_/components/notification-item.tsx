'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Trash2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useNotifications } from '@/services/ws/notification/hooks/use-notifications';
import { type Notification } from '@/types/notification';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: Notification;
}

const notificationIcons: Record<string, string> = {
  course: '📚',
  assignment: '📝',
  achievement: '🏆',
  system: '⚙️',
  message: '💬',
};

const priorityColors = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-700',
};

export function NotificationItem({ notification }: NotificationItemProps) {
  const { markAsRead, deleteNotification } = useNotifications();

  const handleMarkAsRead = async () => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
  };

  const handleDelete = async () => {
    await deleteNotification(notification.id);
  };

  const icon = notificationIcons[notification.category] || '🔔';
  const priorityColor = priorityColors[notification.priority] || priorityColors.low;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          'p-5 hover:shadow-md transition-shadow',
          !notification.isRead && 'border-l-4 border-l-primary',
          notification.priority === 'high' && !notification.isRead && 'border-l-red-500'
        )}
      >
        <div className="flex gap-4">
          {/* Icon */}
          <div className="text-3xl shrink-0 mt-1">{icon}</div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <h3
                  className={cn(
                    'font-semibold text-base leading-tight',
                    !notification.isRead && 'text-foreground',
                    notification.isRead && 'text-muted-foreground'
                  )}
                >
                  {notification.subject}
                </h3>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleMarkAsRead}
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4 text-primary" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={handleDelete}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p
              className={cn(
                'text-sm mb-3',
                !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {notification.message}
            </p>

            {/* Metadata */}
            <div className="flex items-center flex-wrap gap-3 text-xs text-muted-foreground">
              <span>{formatDistanceToNow(new Date(notification.createdAt))}</span>

              <span className="px-2 py-1 bg-muted rounded-md capitalize">
                {notification.category}
              </span>
              <span className={cn('px-2 py-1 rounded-md capitalize font-medium', priorityColor)}>
                {notification.priority}
              </span>

              {!notification.isRead && (
                <span className="flex items-center gap-1 text-primary font-medium">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  Unread
                </span>
              )}
            </div>

            {/* Action URL */}
            {notification.actionUrl && (
              <div className="mt-3">
                <Link href={notification.actionUrl}>
                  <Button variant="outline" size="sm" className="h-8" onClick={handleMarkAsRead}>
                    View Details
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
