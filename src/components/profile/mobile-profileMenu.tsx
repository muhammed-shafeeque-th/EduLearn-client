'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ProfileSidebar } from '../../app/(student)/profile/_/components/profile-sidebar';
import { User } from '@/types/user';

interface MobileProfileMenuProps {
  user: User;
}

export default function MobileProfileMenu({ user }: MobileProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-80">
          <ProfileSidebar user={user} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
