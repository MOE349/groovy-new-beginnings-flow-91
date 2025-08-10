import React from "react";
import { cn } from "@/lib/utils";

export interface GenericTabProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  showHeader?: boolean;
  actions?: React.ReactNode;
}

const GenericTab: React.FC<GenericTabProps> = ({
  title,
  description,
  children,
  className,
  contentClassName,
  showHeader = true,
  actions,
}) => {
  return (
    <div className={cn("tab-content-generic", className)}>
      {showHeader && (title || description || actions) && (
        <div className="flex justify-between items-start mb-4 p-4 pb-0">
          <div>
            {title && <h3 className="text-h3 font-medium text-foreground mb-2">{title}</h3>}
            {description && <p className="text-caption text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      
      <div className={cn("flex-1", contentClassName)}>
        {children}
      </div>
    </div>
  );
};

export default GenericTab;
