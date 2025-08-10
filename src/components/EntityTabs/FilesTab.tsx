import React from "react";
import FilesManager from "@/components/FilesManager";
import { cn } from "@/lib/utils";

export interface FilesTabProps {
  linkToModel: string;
  linkToId: string;
  maxSize?: number;
  title?: string;
  description?: string;
  className?: string;
}

const FilesTab: React.FC<FilesTabProps> = ({
  linkToModel,
  linkToId,
  maxSize = 25,
  title,
  description,
  className,
}) => {
  return (
    <div className={cn("tab-content-generic", className)}>
      <div className="p-4">
        {(title || description) && (
          <div className="mb-4">
            {title && (
              <h3 className="text-h3 font-medium text-foreground mb-2">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-caption text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}

        <FilesManager
          linkToModel={linkToModel}
          linkToId={linkToId}
          maxSize={maxSize}
        />
      </div>
    </div>
  );
};

export default FilesTab;
