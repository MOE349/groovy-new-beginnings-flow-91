import React from "react";
import { cn } from "@/lib/utils";
import GearSpinner from "@/components/ui/gear-spinner";

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
  variant?: "default" | "inline" | "overlay";
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  text = "Loading...",
  className,
  variant = "default",
}) => {
  const spinnerSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <GearSpinner size={size} />
        {text && <span className="text-sm text-muted-foreground">{text}</span>}
      </div>
    );
  }

  if (variant === "overlay") {
    return (
      <div
        className={cn(
          "absolute inset-0 bg-background/80 backdrop-blur-sm",
          "flex items-center justify-center z-50",
          className
        )}
      >
        <div className="flex flex-col items-center space-y-2">
          <GearSpinner size={size} />
          {text && (
            <span className="text-sm text-muted-foreground">{text}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("flex flex-col items-center justify-center p-8", className)}
    >
      <GearSpinner size={size} />
      {text && (
        <span className="text-sm text-muted-foreground mt-2">{text}</span>
      )}
    </div>
  );
};

export default LoadingSpinner;
