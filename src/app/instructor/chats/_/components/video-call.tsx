'use client';

import React from 'react';
import Image from 'next/image';
import { X, Video, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Chat } from '@/types/chat';
import { UserInfo } from '@/types/user';

interface VideoCallProps {
  chat: Chat;
  currentUser: UserInfo;
  otherUser: UserInfo;
  onClose: () => void;
}

/**
 * Video Call  Component
 *
 * This is a placeholder for future WebRTC video call implementation.
 * When ready, this component can be replaced with actual WebRTC functionality.
 */
export function VideoCall({
  // chat,
  // currentUser,
  otherUser,
  onClose,
}: VideoCallProps) {
  const handleStartCall = () => {
    // TODO: Implement WebRTC video call functionality
    // This will involve:
    // 1. Creating a peer connection
    // 2. Getting user media (camera/microphone)
    // 3. Establishing signaling through WebSocket
    // 4. Handling ICE candidates
    // 5. Displaying local and remote video streams
    console.log('Video call functionality to be implemented with WebRTC');
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Video Call</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Call Preview */}
          <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
            {/*  for local video */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-sm">Video call preview</p>
                <p className="text-gray-500 text-xs mt-2">WebRTC implementation coming soon</p>
              </div>
            </div>

            {/* Remote user info overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-lg p-3">
                {otherUser.avatar ? (
                  <Image
                    src={otherUser.avatar}
                    alt={`${otherUser.firstName} ${otherUser.lastName}`}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {otherUser.firstName[0]}
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-white font-medium">
                    {otherUser.firstName} {otherUser.lastName}
                  </p>
                  <p className="text-gray-300 text-xs">Waiting to connect...</p>
                </div>
              </div>
            </div>
          </div>

          {/* Call Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-12 h-12"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>

            <Button
              variant="default"
              size="icon"
              className="rounded-full w-14 h-14 bg-green-600 hover:bg-green-700"
              onClick={handleStartCall}
            >
              <Video className="w-6 h-6" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-12 h-12"
              onClick={onClose}
            >
              <VideoOff className="w-5 h-5" />
            </Button>
          </div>

          {/* Implementation Note */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-200 font-medium mb-2">
              📹 Video Call Feature
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              This is a placeholder for future WebRTC video call implementation. To implement:
            </p>
            <ul className="text-xs text-blue-600 dark:text-blue-400 mt-2 list-disc list-inside space-y-1">
              <li>Set up WebRTC peer connections</li>
              <li>Implement signaling via WebSocket</li>
              <li>Handle media streams (camera/microphone)</li>
              <li>Add ICE candidate exchange</li>
              <li>Implement call state management</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
