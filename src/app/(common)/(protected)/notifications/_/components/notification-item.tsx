'use client';

import {
  Check,
  Trash2,
  ExternalLink,
  BookOpen,
  Award,
  Settings,
  MessageSquare,
  FileText,
  Bell,
  LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useNotifications } from '@/services/ws/notification/hooks/use-notifications';
import { type Notification } from '@/types/notification';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: Notification;
}

const notificationConfigs: Record<string, { icon: LucideIcon; color: string; bgColor: string }> = {
  course: { icon: BookOpen, color: 'text-blue-600', bgColor: 'bg-blue-100/50 dark:bg-blue-900/20' },
  assignment: {
    icon: FileText,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100/50 dark:bg-amber-900/20',
  },
  achievement: {
    icon: Award,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100/50 dark:bg-emerald-900/20',
  },
  system: {
    icon: Settings,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100/50 dark:bg-slate-900/20',
  },
  message: {
    icon: MessageSquare,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100/50 dark:bg-purple-900/20',
  },
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

  const config = notificationConfigs[notification.category] || {
    icon: Bell,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100/50',
  };
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={cn(
          'group relative p-5 rounded-xl border-2 transition-all duration-300',
          !notification.isRead
            ? 'bg-card border-primary/20 shadow-sm'
            : 'bg-muted/30 border-transparent opacity-80'
        )}
      >
        <div className="flex gap-4">
          {/* Icon Section */}
          <div
            className={cn(
              'h-10 w-10 shrink-0 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 duration-500',
              config.bgColor
            )}
          >
            <Icon className={cn('h-5 w-5', config.color)} />
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-1">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3
                    className={cn(
                      'font-semibold text-base leading-tight',
                      !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {notification.subject}
                  </h3>
                  {!notification.isRead && (
                    <span className="flex h-2 w-2 rounded-full bg-primary mt-0.5" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-primary"
                    onClick={handleMarkAsRead}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p
              className={cn(
                'text-sm leading-relaxed mb-3 font-medium',
                !notification.isRead ? 'text-muted-foreground' : 'text-muted-foreground/70'
              )}
            >
              {notification.message}
            </p>

            {/* Bottom Section */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-semibold uppercase border',
                    notification.priority === 'high'
                      ? 'bg-destructive/10 text-destructive border-destructive/20'
                      : notification.priority === 'medium'
                        ? 'bg-amber-100 text-amber-700 border-amber-200'
                        : 'bg-muted text-muted-foreground border-border'
                  )}
                >
                  {notification.priority}
                </span>
                <span className="text-[10px] font-semibold uppercase text-muted-foreground/60">
                  {notification.category}
                </span>
              </div>

              {notification.actionUrl && (
                <Link href={notification.actionUrl} onClick={handleMarkAsRead}>
                  <Button variant="link" className="h-auto p-0 text-primary font-bold text-xs">
                    View Details
                    <ExternalLink className="ml-1.5 h-3 w-3" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
