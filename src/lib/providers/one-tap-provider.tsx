'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { useAuthSync } from '@/hooks/use-auth-sync';
import GoogleOneTapSignIn, {
  GoogleOneTapSignInProps,
} from '@/components/one-tap/google-one-tap-signin';
import { useAuthSelector } from '@/states/client';
import { usePathname } from 'next/navigation';
import { config } from '@/lib/config';

export interface OneTapProviderProps {
  position?: GoogleOneTapSignInProps['position'];
  customStyles?: GoogleOneTapSignInProps['customStyles'];
  offset?: GoogleOneTapSignInProps['offset'];
  autoSelect?: GoogleOneTapSignInProps['autoSelect'];
  cancelOnTapOutside?: GoogleOneTapSignInProps['cancelOnTapOutside'];
}

export default function OneTapProvider({
  position = 'top-right',
  customStyles,
  offset = { top: 20, right: 20 },
  autoSelect = false,
  cancelOnTapOutside = true,
}: OneTapProviderProps) {
  useAuthSync();
  const pathname = usePathname();
  const { status } = useAuthSelector();

  if (status !== 'unauthenticated' || pathname.startsWith('/admin')) {
    return null;
  }

  const clientId = config.googlePublicClientId;
  if (!clientId) return null;

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleOneTapSignIn
        position={position}
        customStyles={customStyles}
        offset={offset}
        autoSelect={autoSelect}
        cancelOnTapOutside={cancelOnTapOutside}
      />
    </GoogleOAuthProvider>
  );
}
