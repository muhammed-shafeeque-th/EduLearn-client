'use client';

import { toast } from '@/hooks/use-toast';
import { useGoogleOneTapLogin } from '@react-oauth/google';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

export type OneTapPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'center-right'
  | 'center-left'
  | 'custom';

export interface GoogleOneTapSignInProps {
  position?: OneTapPosition;
  customStyles?: React.CSSProperties;
  offset?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  autoSelect?: boolean;
  cancelOnTapOutside?: boolean;
}

const CONTAINER_ID = 'google-one-tap-container';

function getPositionStyles(
  position: OneTapPosition = 'top-right',
  offset: GoogleOneTapSignInProps['offset'] = {},
  customStyles?: React.CSSProperties
): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'fixed',
    width: 0,
    height: 0,
    zIndex: 1001,
    pointerEvents: 'auto',
  };
  const o = { top: 20, right: 20, bottom: 20, left: 20, ...offset };

  switch (position) {
    case 'top-left':
      return { ...base, top: `${o.top}px`, left: `${o.left}px` };
    case 'top-right':
      return { ...base, top: `${o.top}px`, right: `${o.right}px` };
    case 'bottom-left':
      return { ...base, bottom: `${o.bottom}px`, left: `${o.left}px` };
    case 'bottom-right':
      return { ...base, bottom: `${o.bottom}px`, right: `${o.right}px` };
    case 'center-left':
      return { ...base, top: '50%', left: `${o.left}px`, transform: 'translateY(-50%)' };
    case 'center-right':
      return { ...base, top: '50%', right: `${o.right}px`, transform: 'translateY(-50%)' };
    case 'custom':
      return { ...base, ...customStyles };
    default:
      return { ...base, top: `${o.top}px`, right: `${o.right}px` };
  }
}

export default function GoogleOneTapSignIn({
  position = 'top-right',
  customStyles,
  offset,
  autoSelect = false,
  cancelOnTapOutside = true,
}: GoogleOneTapSignInProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  // Ensure DOM is ready
  useEffect(() => {
    setReady(true);
  }, []);

  const containerStyles = useMemo(
    () => getPositionStyles(position, offset, customStyles),
    [position, offset, customStyles]
  );

  // Attach computed styles to the ref
  useEffect(() => {
    if (containerRef.current && containerStyles) {
      Object.assign(containerRef.current.style, containerStyles);
    }
  }, [containerStyles]);

  useGoogleOneTapLogin({
    prompt_parent_id: CONTAINER_ID,
    auto_select: autoSelect,
    cancel_on_tap_outside: cancelOnTapOutside,
    promptMomentNotification: (n) => {
      console.log(
        'One Tap:',
        n.getMomentType(),
        n.getSkippedReason(),
        n.getDismissedReason(),
        n.getNotDisplayedReason()
      );
    },
    onSuccess: (credentialResponse) => {
      if (!credentialResponse.credential) {
        toast.error({
          title: 'Google credential missing',
          description: 'Unable to sign in, please try again.',
        });
        return;
      }

      signIn('google-one-tap', {
        credential: credentialResponse.credential,
        redirect: false,
      })
        .then((result) => {
          if (result?.ok) {
            router.refresh();
          } else {
            toast.error({
              title: 'Sign-in failed',
              description: result?.error || 'Unable to complete sign-in. Please try again.',
            });
          }
        })
        .catch((error) => {
          toast.error({
            title: 'Sign-in error',
            description: error?.message || 'An error occurred during sign-in.',
          });
        });
    },
    onError: () => {
      toast.error({
        title: 'Sign-in failed',
        description: 'Google One Tap sign-in was cancelled or failed.',
      });
    },
  });
  if (!ready) return null;

  return <div id={CONTAINER_ID} ref={containerRef} style={containerStyles} aria-hidden="true" />;
}
