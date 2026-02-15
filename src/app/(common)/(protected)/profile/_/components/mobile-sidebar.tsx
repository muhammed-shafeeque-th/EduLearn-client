'use client';

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileSidebar } from './profile-sidebar';
import { User } from '@/types/user';
import { cn } from '@/lib/utils';

interface MobileSidebarProps {
  user: User;
}

export function MobileSidebar({ user }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleSidebar}
        className="lg:hidden"
        aria-label="Toggle navigation menu"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          'fixed top-0 left-0 z-50 h-full transform transition-transform duration-300 ease-in-out lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="relative h-full">
          <Button
            variant="ghost"
            size="icon"
            onClick={closeSidebar}
            className="absolute top-4 right-4 z-10"
            aria-label="Close navigation menu"
          >
            <X className="h-4 w-4" />
          </Button>
          <ProfileSidebar user={user} />
        </div>
      </div>
    </>
  );
}
