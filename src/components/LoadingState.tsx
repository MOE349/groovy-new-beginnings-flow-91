import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import GearSpinner from '@/components/ui/gear-spinner';

interface LoadingStateProps {
  variant?: 'spinner' | 'skeleton' | 'card' | 'table' | 'gear';
  message?: string;
  rows?: number;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  variant = 'spinner',
  message = 'Loading...',
  rows = 5,
  className = '',
}) => {
  switch (variant) {
    case 'gear':
      return (
        <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
          <GearSpinner />
          {message && <p className="mt-4 text-sm text-muted-foreground">{message}</p>}
        </div>
      );

    case 'spinner':
      return (
        <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          {message && <p className="mt-4 text-sm text-muted-foreground">{message}</p>}
        </div>
      );

    case 'skeleton':
      return (
        <div className={`space-y-4 ${className}`}>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      );

    case 'card':
      return (
        <Card className={className}>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: rows }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      );

    case 'table':
      return (
        <div className={`w-full ${className}`}>
          <div className="space-y-2">
            {/* Table header */}
            <div className="flex gap-4 p-4 border-b">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 flex-1" />
              ))}
            </div>
            {/* Table rows */}
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="flex gap-4 p-4 border-b">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-4 flex-1" />
                ))}
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
};

// Inline loading indicator for buttons or small areas
export const InlineLoader: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Loader2 className={`h-4 w-4 animate-spin ${className}`} />
);

// Full page loading overlay
export const LoadingOverlay: React.FC<{ message?: string }> = ({ message }) => (
  <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <GearSpinner />
      {message && <p className="text-sm font-medium">{message}</p>}
    </div>
  </div>
);

// Loading wrapper that shows loading state while condition is true
interface LoadingWrapperProps {
  loading: boolean;
  error?: Error | null;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
}

export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  loading,
  error,
  children,
  loadingComponent,
  errorComponent,
}) => {
  if (error) {
    return (
      <>
        {errorComponent || (
          <div className="flex flex-col items-center justify-center p-8 text-destructive">
            <p className="font-medium">Error loading data</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        )}
      </>
    );
  }

  if (loading) {
    return <>{loadingComponent || <LoadingState variant="gear" />}</>;
  }

  return <>{children}</>;
};