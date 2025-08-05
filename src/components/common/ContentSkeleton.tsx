import React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export interface ContentSkeletonProps {
  className?: string;
  variant?: "form" | "table" | "card" | "list" | "custom";
  lines?: number;
  showAvatar?: boolean;
}

export const ContentSkeleton: React.FC<ContentSkeletonProps> = ({
  className,
  variant = "form",
  lines = 3,
  showAvatar = false,
}) => {
  if (variant === "form") {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className={cn("space-y-3", className)}>
        {/* Table header */}
        <div className="flex space-x-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-6 flex-1" />
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex space-x-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} className="h-8 flex-1" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn("space-y-4 p-4 border rounded-lg", className)}>
        {showAvatar && (
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        )}
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            {showAvatar && <Skeleton className="h-8 w-8 rounded-full" />}
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Custom variant - just basic lines
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  );
};

export default ContentSkeleton;
