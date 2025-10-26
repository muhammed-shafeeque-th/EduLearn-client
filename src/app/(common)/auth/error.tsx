'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AuthError({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Something went wrong
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {error.message || 'An unexpected error occurred during authentication.'}
          </p>
        </div>

        {/* Error Card */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              Authentication Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                We encountered an issue while processing your request. Please try again or contact
                support if the problem persists.
              </p>
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={() => reset()}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  Try again
                </Button>
                <Button variant="outline" asChild className="w-full h-11">
                  <Link href="/auth/login">Back to login</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Need help?{' '}
            <Link
              href="/support"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
