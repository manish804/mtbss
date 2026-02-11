"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorFallbackProps {
  error?: Error;
  resetError: () => void;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center"
      role="alert"
      aria-labelledby="error-title"
    >
      <div
        className="bg-destructive/10 rounded-full p-4 mb-6"
        aria-hidden="true"
      >
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>

      <h2 id="error-title" className="text-2xl font-bold mb-4">
        Something went wrong
      </h2>

      <p className="text-muted-foreground mb-6 max-w-md">
        We encountered an unexpected error while loading this content. Please
        try refreshing the page or contact support if the problem persists.
      </p>

      {process.env.NODE_ENV === "development" && error && (
        <details className="mb-6 p-4 bg-muted rounded-lg text-left max-w-2xl">
          <summary className="cursor-pointer font-medium mb-2">
            Error Details (Development)
          </summary>
          <pre className="text-sm text-destructive whitespace-pre-wrap">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        </details>
      )}

      <Button onClick={resetError} className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
}

export function JobsErrorFallback({ resetError }: ErrorFallbackProps) {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center bg-card/50 rounded-lg border"
      role="alert"
      aria-labelledby="jobs-error-title"
    >
      <div
        className="bg-destructive/10 rounded-full p-3 mb-4"
        aria-hidden="true"
      >
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>

      <h3 id="jobs-error-title" className="text-lg font-semibold mb-2">
        Unable to Load Job Listings
      </h3>

      <p className="text-muted-foreground mb-4 max-w-sm">
        We&apos;re having trouble loading the job listings right now. Please try
        again in a moment.
      </p>

      <Button
        onClick={resetError}
        size="sm"
        variant="outline"
        className="gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Retry
      </Button>
    </div>
  );
}
