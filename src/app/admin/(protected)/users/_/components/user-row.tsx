'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserMeta } from '@/types/user';

interface UserRowProps {
  user: UserMeta;
}

export function UserRow({ user }: UserRowProps) {
  // Generate initials safely for avatar fallback
  const getInitials = (firstName?: string, lastName?: string): string => {
    const names = [];
    if (firstName && firstName.trim().length > 0) {
      names.push(firstName.trim().charAt(0));
    }
    if (lastName && lastName.trim().length > 0) {
      names.push(lastName.trim().charAt(0));
    }
    return names.join('').toUpperCase() || '?';
  };

  return (
    <Button
      type="button"
      variant="ghost"
      className="flex items-center space-x-3 h-auto p-2 justify-start"
      tabIndex={0}
      aria-label={`View user ${user.firstName} ${user.lastName || ''}`}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage
          src={user.avatar ?? undefined}
          alt={`${user.firstName || ''} ${user.lastName || ''}`.trim()}
        />
        <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
      </Avatar>
      <div className="text-left min-w-0">
        <div className="font-medium truncate">
          {user.firstName} {user.lastName}
        </div>
        <div className="text-sm text-muted-foreground truncate">{user.email}</div>
      </div>
    </Button>
  );
}
