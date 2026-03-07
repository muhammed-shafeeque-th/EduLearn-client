'use client';

import { Bell, BookOpen, FileText, Award, Settings, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationType } from '@/types/notification';

interface NotificationFiltersProps {
  typeFilter: NotificationType | 'all';
  onTypeFilterChange: (type: NotificationType | 'all') => void;
}

const notificationTypes = [
  { value: 'all', label: 'All', icon: Bell },
  { value: 'course', label: 'Courses', icon: BookOpen },
  { value: 'assignment', label: 'Assignments', icon: FileText },
  { value: 'achievement', label: 'Achievements', icon: Award },
  { value: 'system', label: 'System', icon: Settings },
  { value: 'message', label: 'Messages', icon: MessageSquare },
] as const;

export function NotificationFilters({ typeFilter, onTypeFilterChange }: NotificationFiltersProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
        Filter by Category
      </h4>
      <div className="flex flex-wrap gap-2">
        {notificationTypes.map((type) => {
          const Icon = type.icon;
          const isActive = typeFilter === type.value;

          return (
            <button
              key={type.value}
              onClick={() => onTypeFilterChange(type.value as NotificationType | 'all')}
              className={cn(
                'inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border-2',
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 scale-105'
                  : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900/30'
              )}
            >
              <Icon className={cn('h-4 w-4', !isActive && 'text-slate-400')} />
              <span>{type.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
