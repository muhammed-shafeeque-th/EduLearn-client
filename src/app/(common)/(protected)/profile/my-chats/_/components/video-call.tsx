'use client';

import React from 'react';
import { X, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Chat } from '@/types/chat';
import type { UserInfo } from '@/types/user';

interface VideoCallProps {
  chat: Chat;
  currentUser: UserInfo;
  otherUser: UserInfo;
  onClose: () => void;
}

/**
 * Video Call Component
 *
 * This is a placeholder to inform users that the video call feature is coming soon.
 * Implementation with WebRTC will be available in a future update.
 */
export function VideoCall({ onClose }: VideoCallProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Video Call</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close video call dialog"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-8">
          <Video className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-xl font-semibold text-center text-gray-800 dark:text-gray-100">
            Coming Soon!
          </p>
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm max-w-xs">
            The video call feature will be available soon. Our team is working hard to bring you
            seamless and secure video calls.
          </p>
          <Button variant="outline" className="mt-4" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
