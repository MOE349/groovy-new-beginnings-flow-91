import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export interface ErrorDisplayProps {
  error: Error | string;
  title?: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
  variant?: "default" | "compact" | "alert";
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  title = "Something went wrong",
  onRetry,
  retryText = "Try again",
  className,
  variant = "default",
}) => {
  const errorMessage = error instanceof Error ? error.message : error;

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center space-x-2 text-destructive",
          className
        )}
      >
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm">{errorMessage}</span>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="h-auto p-1 text-destructive hover:text-destructive"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  if (variant === "alert") {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">
          {errorMessage}
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-2 h-8"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              {retryText}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        className
      )}
    >
      <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md">
        {errorMessage}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          {retryText}
        </Button>
      )}
    </div>
  );
};

export default ErrorDisplay;
