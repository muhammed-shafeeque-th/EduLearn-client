'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { InstructorMeta } from '@/types/user';
import { useRouter } from 'next/navigation';

interface InstructorRowProps {
  instructor: InstructorMeta;
}

export function InstructorRow({ instructor }: InstructorRowProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/admin/instructors/${instructor.id}`);
  };

  return (
    <Button
      variant="ghost"
      className="flex items-center space-x-3 h-auto p-2 justify-start"
      onClick={handleClick}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={instructor.avatar} alt={instructor.username} />
        <AvatarFallback>
          {instructor.username
            ?.split(' ')
            .map((n) => n[0])
            .join('')}
        </AvatarFallback>
      </Avatar>
      <div className="text-left">
        <div className="font-medium">{instructor.username}</div>
        <div className="text-sm text-muted-foreground">{instructor.email}</div>
      </div>
    </Button>
  );
}
