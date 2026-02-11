'use client';

import { useAuthSync } from '@/hooks/use-auth-sync';
import GoogleOneTapSignIn, {
  GoogleOneTapSignInProps,
} from '@/components/one-tap/google-one-tap-signin';
import { useAuthSelector } from '@/states/client';

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

  // Only render the One Tap component if the user is not authenticated
  const { status } = useAuthSelector();

  if (status !== 'unauthenticated') {
    return null;
  }

  return (
    <GoogleOneTapSignIn
      position={position}
      customStyles={customStyles}
      offset={offset}
      autoSelect={autoSelect}
      cancelOnTapOutside={cancelOnTapOutside}
    />
  );
}
