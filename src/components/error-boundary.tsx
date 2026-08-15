'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
  level?: 'page' | 'component' | 'section';
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      eventId: generateErrorId(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      errorInfo,
    });

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);

    // Log to error reporting service in production
    this.logErrorToService(error, errorInfo);

    // Track error in analytics
    this.trackError(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error boundary when resetKeys change
    if (hasError && resetOnPropsChange && resetKeys) {
      const prevResetKeys = prevProps.resetKeys || [];
      if (resetKeys.some((key, idx) => key !== prevResetKeys[idx])) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    if (process.env.NODE_ENV === 'production') {
      // Example with Sentry
      // Sentry.withScope((scope) => {
      //   scope.setTag('errorBoundary', true);
      //   scope.setLevel('error');
      //   scope.setContext('errorInfo', errorInfo);
      //   scope.setContext('errorBoundaryLevel', this.props.level || 'component');
      //   Sentry.captureException(error);
      // });

      // Example with custom error service
      try {
        fetch('/api/errors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            error: {
              message: error.message,
              stack: error.stack,
              name: error.name,
            },
            errorInfo,
            level: this.props.level || 'component',
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            eventId: this.state.eventId,
          }),
        }).catch((fetchError) => {
          console.error('Failed to log error to service:', fetchError);
        });
      } catch (loggingError) {
        console.error('Error logging failed:', loggingError);
      }
    }
  };

  private trackError = (error: Error, errorInfo: ErrorInfo) => {
    // Track in Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: this.props.level === 'page',
        error_boundary_level: this.props.level || 'component',
      });
    }

    // Track in custom analytics
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('Error Boundary Triggered', {
        errorMessage: error.message,
        errorStack: error.stack,
        componentStack: errorInfo.componentStack,
        level: this.props.level || 'component',
        eventId: this.state.eventId,
      });
    }
  };

  private resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
      showDetails: false,
    });
  };

  private handleRetry = () => {
    this.resetErrorBoundary();

    // Optional: Reload the page for page-level errors
    if (this.props.level === 'page') {
      this.resetTimeoutId = window.setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private copyErrorDetails = async () => {
    const { error, errorInfo, eventId } = this.state;

    const errorDetails = {
      eventId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      error: {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
      },
      componentStack: errorInfo?.componentStack,
      level: this.props.level || 'component',
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
      // In a real app, show a toast notification
      console.log('Error details copied to clipboard');
    } catch (clipboardError) {
      console.error('Failed to copy error details:', clipboardError);
    }
  };

  private toggleDetails = () => {
    this.setState((prevState) => ({
      showDetails: !prevState.showDetails,
    }));
  };

  render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Render appropriate error UI based on level
      return this.renderErrorUI();
    }

    return this.props.children;
  }

  private renderErrorUI = () => {
    const { level = 'component', showDetails = false } = this.props;
    const { error, errorInfo, eventId, showDetails: stateShowDetails } = this.state;

    // Page-level error (full screen)
    if (level === 'page') {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">
                  We&apos;re sorry! An unexpected error occurred while loading this page.
                </p>
                {eventId && (
                  <p className="text-sm text-muted-foreground">
                    Error ID:{' '}
                    <code className="bg-muted px-1 py-0.5 rounded text-xs">{eventId}</code>
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={this.handleRetry} className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
                <Button onClick={this.handleReload} variant="outline">
                  Reload Page
                </Button>
                <Button variant="outline" asChild>
                  <Link href={ROUTES.public.home} className="flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Go Home
                  </Link>
                </Button>
              </div>

              {(showDetails || process.env.NODE_ENV === 'development') && (
                <div className="space-y-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={this.toggleDetails}
                    className="w-full flex items-center gap-2"
                  >
                    <Bug className="w-4 h-4" />
                    {stateShowDetails ? 'Hide' : 'Show'} Error Details
                    {stateShowDetails ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>

                  {stateShowDetails && (
                    <div className="space-y-4">
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">Error Details</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={this.copyErrorDetails}
                            className="h-8 px-2"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <pre className="text-xs text-muted-foreground overflow-auto max-h-40">
                          {error?.message}
                        </pre>
                      </div>

                      {process.env.NODE_ENV === 'development' && error?.stack && (
                        <div className="bg-muted p-4 rounded-lg">
                          <h4 className="font-medium text-sm mb-2">Stack Trace</h4>
                          <pre className="text-xs text-muted-foreground overflow-auto max-h-40">
                            {error.stack}
                          </pre>
                        </div>
                      )}

                      {process.env.NODE_ENV === 'development' && errorInfo?.componentStack && (
                        <div className="bg-muted p-4 rounded-lg">
                          <h4 className="font-medium text-sm mb-2">Component Stack</h4>
                          <pre className="text-xs text-muted-foreground overflow-auto max-h-40">
                            {errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="text-center text-sm text-muted-foreground">
                <p>If this problem persists, please contact our support team.</p>
                <Button variant="link" size="sm" asChild className="mt-2">
                  <Link href={ROUTES.public.support}>Contact Support</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Component-level error (inline)
    if (level === 'component') {
      return (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-medium text-sm">Component Error</h3>
                  <p className="text-sm text-muted-foreground">
                    This component encountered an error and couldn&apos;t render properly.
                  </p>
                  {eventId && (
                    <p className="text-xs text-muted-foreground mt-1">Error ID: {eventId}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button onClick={this.handleRetry} size="sm" variant="outline">
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Retry
                  </Button>
                  {process.env.NODE_ENV === 'development' && (
                    <Button onClick={this.toggleDetails} size="sm" variant="ghost">
                      <Bug className="w-3 h-3 mr-1" />
                      Details
                    </Button>
                  )}
                </div>
                {process.env.NODE_ENV === 'development' && stateShowDetails && (
                  <div className="bg-muted p-3 rounded text-xs">
                    <pre className="overflow-auto max-h-32">{error?.message}</pre>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Section-level error (minimal)
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              Section unavailable
            </p>
            <p className="text-xs text-red-600 dark:text-red-300">
              This section encountered an error.
            </p>
          </div>
          <Button onClick={this.handleRetry} size="sm" variant="ghost">
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </div>
    );
  };
}

// Utility function to generate unique error IDs
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryConfig?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WithErrorBoundaryComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryConfig}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithErrorBoundaryComponent;
}

// React hook for error boundary
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  return { captureError, resetError };
}

// Async error boundary for handling async errors
export function useAsyncError() {
  const { captureError } = useErrorBoundary();

  return React.useCallback(
    (error: Error) => {
      // Use setTimeout to escape the current call stack
      setTimeout(() => {
        captureError(error);
      }, 0);
    },
    [captureError]
  );
}

// Global error handler for uncaught errors
export function setupGlobalErrorHandling() {
  if (typeof window === 'undefined') return;

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);

    // Track in analytics
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: `Unhandled promise rejection: ${event.reason}`,
        fatal: false,
      });
    }

    // Prevent the default browser behavior
    event.preventDefault();
  });

  // Handle uncaught JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);

    // Track in analytics
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: `Uncaught error: ${event.error?.message || event.message}`,
        fatal: false,
      });
    }
  });
}

// Example usage patterns
export const ErrorBoundaryExamples = {
  // Page-level error boundary
  PageErrorBoundary: ({ children }: { children: ReactNode }) => (
    <ErrorBoundary
      level="page"
      onError={(error, errorInfo) => {
        console.error('Page error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  ),

  // Component-level error boundary
  ComponentErrorBoundary: ({ children }: { children: ReactNode }) => (
    <ErrorBoundary
      level="component"
      resetOnPropsChange={true}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      {children}
    </ErrorBoundary>
  ),

  // Section-level error boundary
  SectionErrorBoundary: ({ children }: { children: ReactNode }) => (
    <ErrorBoundary level="section">{children}</ErrorBoundary>
  ),
};

// Type declarations for global error tracking
declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: Record<string, any>) => void;
    analytics?: {
      track: (event: string, properties?: Record<string, any>) => void;
    };
  }
}

export default ErrorBoundary;
