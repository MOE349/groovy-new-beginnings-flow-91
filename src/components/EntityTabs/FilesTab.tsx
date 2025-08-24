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
  isReadOnly?: boolean;
}

const FilesTab: React.FC<FilesTabProps> = ({
  linkToModel,
  linkToId,
  maxSize = 25,
  title,
  description,
  className,
  isReadOnly = false,
}) => {
  return (
    <div className={cn("tab-content-generic", className)}>
      <div className="rounded-lg bg-card text-card-foreground shadow-card hover:shadow-hover transition-shadow duration-150 border-0 flex flex-col h-full min-h-0 p-0 w-full">
        <FilesManager
          linkToModel={linkToModel}
          linkToId={linkToId}
          maxSize={maxSize}
          isReadOnly={isReadOnly}
        />
      </div>
    </div>
  );
};

export default FilesTab;
