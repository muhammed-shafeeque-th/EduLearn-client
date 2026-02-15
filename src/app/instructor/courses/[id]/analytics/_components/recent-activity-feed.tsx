'use client';

import { Badge } from '@/components/ui/badge';
import { MessageSquare, Star, ShoppingCart, Eye } from 'lucide-react';

interface Activity {
  type: 'comment' | 'rating' | 'purchase' | 'view';
  user: string;
  action: string;
  content: string;
  time: string;
  avatar: string;
}

interface RecentActivityFeedProps {
  activities: Activity[];
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'rating':
        return <Star className="w-4 h-4 text-yellow-600" />;
      case 'purchase':
        return <ShoppingCart className="w-4 h-4 text-green-600" />;
      case 'view':
        return <Eye className="w-4 h-4 text-purple-600" />;
      default:
        return <Eye className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'comment':
        return 'bg-blue-100 text-blue-800';
      case 'rating':
        return 'bg-yellow-100 text-yellow-800';
      case 'purchase':
        return 'bg-green-100 text-green-800';
      case 'view':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div
          key={index}
          className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-medium">
              {activity.avatar}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-sm">{activity.user}</span>
              <Badge variant="outline" className={`text-xs ${getActivityColor(activity.type)}`}>
                <div className="mr-1">{getActivityIcon(activity.type)}</div>
                {activity.type}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {activity.action} <span className="font-medium">&quot;{activity.content}&quot;</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
