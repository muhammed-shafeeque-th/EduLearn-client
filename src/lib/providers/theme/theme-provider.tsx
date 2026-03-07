'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * ThemeProvider wraps the app with next-themes for dark/light mode support.
 * @param children - The content to render inside the theme provider
 * @param props - Additional props for next-themes ThemeProvider
 */
export const ThemeProvider: React.FC<React.ComponentProps<typeof NextThemesProvider>> = React.memo(
  ({ children, ...props }) => {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
  }
);

ThemeProvider.displayName = 'ThemeProvider';
