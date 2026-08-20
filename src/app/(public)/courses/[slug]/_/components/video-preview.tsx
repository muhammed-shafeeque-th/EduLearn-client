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
      <DialogContent
        className="
          w-[calc(100%-1rem)]
          max-w-4xl
          max-h-[90dvh]
          overflow-y-auto
          overflow-x-hidden
          border-0
          bg-black
          p-0
          text-white
        "
      >
        <DialogHeader className="px-4 pt-4 pb-3 sm:px-6">
          <DialogTitle
            className="
              flex
              min-w-0
              flex-wrap
              items-center
              gap-2
              pr-8
              text-base
              font-semibold
              sm:text-xl
            "
          >
            <span className="min-w-0 break-words">{videoData.title}</span>

            {videoData.type === 'preview' && <Badge className="shrink-0">Free Preview</Badge>}
          </DialogTitle>
        </DialogHeader>

        <div className="relative w-full overflow-hidden bg-black">
          {videoData.url ? (
            <div className="aspect-video w-full">
              <video
                ref={videoRef}
                playsInline
                controls={false}
                preload="metadata"
                className="h-full w-full object-contain"
              >
                <track kind="captions" />
              </video>
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center text-gray-400">
              No preview available
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
