/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useRef } from 'react';
// We can now import Plyr directly because this file is only loaded on the client
import Plyr from 'plyr';
import type { LessonWithProgress } from '@/types/enrollment/enrollment.type';
import { useVideoProgress } from '@/states/server/enrollment/use-enrollment-progress';

// import 'plyr/dist/plyr.css';
// import { toast } from '@/hooks/use-toast';

interface Props {
  enrollmentId: string;
  lesson: LessonWithProgress;
  onVideoEnd?: () => void;
}

const PROGRESS_UPDATE_THRESHOLD_MS = 15 * 1000;
const SIGNED_URL_REFRESH_INTERVAL_MS = 10 * 60 * 1000;

export default function PlyrWrapper({ enrollmentId, lesson, onVideoEnd }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Plyr | null>(null);
  const lastProgressSent = useRef<number>(0);
  const refreshControllerRef = useRef<AbortController | null>(null);

  // Hook data
  const { getSignedVideoUrl, refreshVideoUrl, updateProgress, getLessonProgress } =
    useVideoProgress(enrollmentId);
  const lessonProgress = getLessonProgress(lesson.id);

  useEffect(() => {
    // Controller for THIS specific video load
    const abortController = new AbortController();
    const { signal } = abortController;
    let instance: Plyr | null = null;

    async function bootstrap() {
      if (!videoRef.current) return;

      try {
        // 1. Fetch URL immediately
        // (Plyr code is already loaded by the time this runs)
        const signed = await getSignedVideoUrl(lesson.id, signal);

        if (signal.aborted) return;

        // 2. Init Plyr
        instance = new Plyr(videoRef.current!, {
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
          settings: ['speed'],
          keyboard: { focused: false, global: true },
          speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
          // Optimization: Disable some heavy features if not needed
          tooltips: { controls: true, seek: true },
        });

        playerRef.current = instance;

        // 3. Set Source
        instance.source = {
          type: 'video',
          sources: [{ src: signed.url, type: 'video/mp4' }],
        };

        // 4. Set Metadata / Resume
        instance.on('loadedmetadata', () => {
          if (signal.aborted || !instance) return;
          if (lessonProgress?.watchTime && instance.duration) {
            const percent = (lessonProgress.watchTime / instance.duration) * 100;
            if (percent < 95) {
              instance.currentTime = lessonProgress.watchTime;
            }
          }
        });

        // 5. Events
        instance.on('timeupdate', () => {
          if (!instance || signal.aborted) return;
          const now = Date.now();
          if (now - lastProgressSent.current < PROGRESS_UPDATE_THRESHOLD_MS) return;

          lastProgressSent.current = now;
          updateProgress(lesson.id, instance.currentTime, instance.duration, false);
        });

        instance.on('ended', async () => {
          if (!instance || signal.aborted) return;
          await updateProgress(lesson.id, instance.duration, instance.duration, true);
          onVideoEnd?.();
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Player Init Error:', err);
          // toast.error({ title: 'Failed to load video.' });
        }
      }
    }

    bootstrap();

    return () => {
      abortController.abort();
      if (instance) instance.destroy();
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  // Background Refresh Logic (Optimized)
  useEffect(() => {
    const interval = setInterval(async () => {
      const player = playerRef.current;
      if (!player || player.paused) return;

      if (refreshControllerRef.current) refreshControllerRef.current.abort();
      const controller = new AbortController();
      refreshControllerRef.current = controller;

      try {
        const ct = player.currentTime;
        const wasPlaying = !player.paused;
        const refreshed = await refreshVideoUrl(lesson.id, controller.signal);

        if (controller.signal.aborted) return;

        player.source = {
          type: 'video',
          sources: [{ src: refreshed.url, type: 'video/mp4' }],
        };

        player.once('loadedmetadata', () => {
          if (controller.signal.aborted) return;
          player.currentTime = ct;
          if (wasPlaying) player.play();
        });
      } catch (e: any) {
        if (e.name !== 'AbortError') console.error(e);
      }
    }, SIGNED_URL_REFRESH_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      refreshControllerRef.current?.abort();
    };
  }, [lesson.id, refreshVideoUrl]);

  return (
    <video
      ref={videoRef}
      playsInline
      crossOrigin="anonymous"
      className="w-full h-full"
      preload="metadata"
      tabIndex={0}
      aria-label={lesson.title ?? 'Lesson video'}
    >
      <track kind="captions" />
    </video>
  );
}
