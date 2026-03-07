'use client';
import React from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        {error.message || 'An unexpected error occurred.'}
      </p>
      <button
        className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary-hover transition"
        onClick={() => reset()}
      >
        Reload
      </button>
    </div>
  );
}
