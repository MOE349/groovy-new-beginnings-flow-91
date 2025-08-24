/**
 * FileActions Component
 * Action buttons for file operations (download, edit, delete)
 */

import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import type { FileActionsProps } from "../types";

export const FileActions: React.FC<FileActionsProps> = ({
  file,
  onEdit,
  onDelete,
  isDeleting = false,
}) => {
  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          // This will be handled by the parent component via useFileOperations
          // We'll pass the download function up
        }}
        title="Download file"
      >
        <Download className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(file.id);
        }}
        disabled={isDeleting}
        title="Delete file"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
