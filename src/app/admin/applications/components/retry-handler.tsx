"use client";

import { useState, useCallback } from "react";
import { RefreshCw, AlertCircle, Wifi, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RetryHandlerProps {
  onRetry: () => Promise<void> | void;
  error?: Error | string;
  title?: string;
  description?: string;
  maxRetries?: number;
  showRetryCount?: boolean;
  variant?: "card" | "inline" | "alert";
}

export function RetryHandler({
  onRetry,
  error,
  title = "Something went wrong",
  description = "An error occurred while loading data.",
  maxRetries = 3,
  showRetryCount = true,
  variant = "card",
}: RetryHandlerProps) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useState(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  });

  const handleRetry = useCallback(async () => {
    if (retryCount >= maxRetries) return;

    setIsRetrying(true);
    try {
      await onRetry();
      setRetryCount(0);
    } catch (error) {
      setRetryCount((prev) => prev + 1);
      console.error("Retry failed:", error);
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry, retryCount, maxRetries]);

  const canRetry = retryCount < maxRetries && isOnline;
  const errorMessage =
    typeof error === "string"
      ? error
      : error?.message || "Unknown error occurred";

  if (variant === "alert") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{errorMessage}</span>
          {canRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={isRetrying}
              className="ml-4"
            >
              {isRetrying ? (
                <RefreshCw className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-1" />
              )}
              Retry
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (variant === "inline") {
    return (
      <div className="flex items-center justify-center p-6 border border-red-200 bg-red-50 rounded-lg">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-red-800">{title}</p>
            <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
          </div>
          {!isOnline && (
            <div className="flex items-center justify-center gap-2 text-xs text-red-600">
              <WifiOff className="h-3 w-3" />
              <span>No internet connection</span>
            </div>
          )}
          {canRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={isRetrying}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              {isRetrying ? (
                <RefreshCw className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-1" />
              )}
              Try Again
              {showRetryCount && retryCount > 0 && (
                <span className="ml-1">
                  ({retryCount}/{maxRetries})
                </span>
              )}
            </Button>
          )}
          {retryCount >= maxRetries && (
            <p className="text-xs text-red-500">
              Maximum retry attempts reached. Please refresh the page.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        <CardTitle className="text-lg text-gray-900">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800 break-words">{errorMessage}</p>
        </div>

        {!isOnline && (
          <div className="flex items-center justify-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <WifiOff className="h-4 w-4 text-amber-600" />
            <span className="text-sm text-amber-800">
              No internet connection
            </span>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {canRetry ? (
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full"
            >
              {isRetrying ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Try Again
              {showRetryCount && retryCount > 0 && (
                <span className="ml-1">
                  ({retryCount}/{maxRetries})
                </span>
              )}
            </Button>
          ) : (
            <div className="text-center">
              <p className="text-sm text-red-600 mb-2">
                {retryCount >= maxRetries
                  ? "Maximum retry attempts reached"
                  : "Unable to retry while offline"}
              </p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
            </div>
          )}
        </div>

        {isOnline && (
          <div className="flex items-center justify-center gap-2 text-xs text-green-600">
            <Wifi className="h-3 w-3" />
            <span>Connected</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function useRetryHandler(maxRetries: number = 3) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const executeWithRetry = useCallback(
    <T,>(
      operation: () => Promise<T>,
      onError?: (error: Error, attempt: number) => void
    ) => {
      return (async (): Promise<T> => {
        let lastError: Error;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            setIsRetrying(attempt > 0);
            setRetryCount(attempt);

            const result = await operation();

            setRetryCount(0);
            setIsRetrying(false);

            return result;
          } catch (error) {
            lastError = error as Error;

            if (onError) {
              onError(lastError, attempt + 1);
            }

            if (attempt === maxRetries) {
              break;
            }

            const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }

        setIsRetrying(false);
        throw lastError!;
      })();
    },
    [maxRetries]
  );

  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return {
    executeWithRetry,
    retryCount,
    isRetrying,
    reset,
    canRetry: retryCount < maxRetries,
  };
}
