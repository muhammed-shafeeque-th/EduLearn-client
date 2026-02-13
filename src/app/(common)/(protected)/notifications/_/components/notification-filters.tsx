'use client';

import { cn } from '@/lib/utils';
import { NotificationType } from '@/types/notification';

interface NotificationFiltersProps {
  typeFilter: NotificationType | 'all';
  onTypeFilterChange: (type: NotificationType | 'all') => void;
}

const notificationTypes = [
  { value: 'all', label: 'All Types', icon: '🔔' },
  { value: 'course', label: 'Courses', icon: '📚' },
  { value: 'assignment', label: 'Assignments', icon: '📝' },
  { value: 'achievement', label: 'Achievements', icon: '🏆' },
  { value: 'system', label: 'System', icon: '⚙️' },
  { value: 'message', label: 'Messages', icon: '💬' },
] as const;

export function NotificationFilters({ typeFilter, onTypeFilterChange }: NotificationFiltersProps) {
  return (
    <div className="mt-4 pt-4 border-t">
      <h4 className="text-sm font-medium mb-3 text-muted-foreground">Filter by Type</h4>
      <div className="flex flex-wrap gap-2">
        {notificationTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => onTypeFilterChange(type.value as NotificationType | 'all')}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
              'hover:scale-105 active:scale-95',
              typeFilter === type.value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            <span className="text-base">{type.icon}</span>
            <span>{type.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
