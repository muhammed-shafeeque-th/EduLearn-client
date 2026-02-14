'use client';

import { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type Plyr from 'plyr';

//  Lazy load Plyr styles once globally
import 'plyr/dist/plyr.css';

interface VideoPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  videoData: {
    title: string;
    url: string | null;
    type: 'video' | 'preview';
  };
}

/**
 * Fully reliable Plyr video preview component
 * Works correctly with Next.js + Shadcn Dialog + SSR
 */
export function VideoPreview({ isOpen, onClose, videoData }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<Plyr | null>(null);

  // Initialize Plyr *after* the dialog is fully mounted
  useEffect(() => {
    if (!isOpen || !videoData.url) return;

    // Wait a short moment for Radix portal to finish rendering
    const timer = setTimeout(async () => {
      const videoElement = videoRef.current;
      if (!videoElement) return;

      // Clean up any existing player
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      try {
        const { default: Plyr } = await import('plyr');

        const player = new Plyr(videoElement, {
          controls: [
            'play-large',
            'play',
            'progress',
            'current-time',
            'duration',
            'mute',
            'volume',
            'settings',
            'fullscreen',
          ],
          settings: ['quality', 'speed'],
          quality: { default: 720, options: [1080, 720, 480, 360] },
        });

        player.source = {
          type: 'video',
          sources: [
            {
              src: videoData.url!,
              type: 'video/mp4',
              size: 720,
            },
          ],
        };

        playerRef.current = player;

        // Autoplay muted previews
        if (videoData.type === 'preview') {
          player.muted = true;
          const playPromise = player.play();
          if (playPromise) {
            playPromise.catch(() => toast.info('Click play to start preview'));
          }
        }
      } catch (error) {
        console.error('Plyr failed to initialize:', error);
      }
    }, 200); // ⏳ delay ensures portal is mounted

    return () => {
      clearTimeout(timer);
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [isOpen, videoData.url, videoData.type]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-black text-white">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            {videoData.title}
            {videoData.type === 'preview' && <Badge>Free Preview</Badge>}
          </DialogTitle>
        </DialogHeader>
        <div className="relative w-full aspect-video bg-black">
          {videoData.url ? (
            <video
              ref={videoRef}
              playsInline
              controls={false}
              preload="metadata"
              className="w-full h-full object-contain bg-black"
            >
              <track kind="captions" />
            </video>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No preview available
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
