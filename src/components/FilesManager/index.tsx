/**
 * FilesManager Component
 * Modular, performant file management with upload/download/edit capabilities
 */

import React, { useState } from "react";
import {
  FileUploadDialog,
  FileEditDialog,
  FilesTable,
  SimpleFileUploadZone,
} from "./components";
import type { FilesManagerProps, FileItem } from "./types";

export const FilesManager: React.FC<FilesManagerProps> = ({
  linkToModel,
  linkToId,
  maxSize = 10,
  className = "",
  isReadOnly = false,
  simple = false,
  multiple = true,
  accept = "*/*",
  onFileUploaded,
}) => {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<FileItem | null>(null);

  const handleEditFile = (file: FileItem) => {
    setEditingFile(file);
    setIsEditDialogOpen(true);
  };

  const handleCreateNew = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsUploadDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setEditingFile(null);
  };

  // Simple mode: Just file upload without table/management
  if (simple) {
    return (
      <div className={className}>
        <SimpleFileUploadZone
          maxSize={maxSize}
          multiple={multiple}
          accept={accept}
          onFileUploaded={onFileUploaded}
        />
      </div>
    );
  }

  // Full mode: Complete file management system
  if (!linkToModel || !linkToId) {
    console.warn(
      "FilesManager: linkToModel and linkToId are required for full mode"
    );
    return (
      <div className={className}>
        <div className="p-4 border rounded-lg bg-muted/50 text-center text-muted-foreground">
          File management requires linkToModel and linkToId props.
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <FilesTable
        linkToModel={linkToModel}
        linkToId={linkToId}
        onEditFile={handleEditFile}
        onCreateNew={handleCreateNew}
        isReadOnly={isReadOnly}
      />

      {!isReadOnly && (
        <FileUploadDialog
          isOpen={isUploadDialogOpen}
          onOpenChange={setIsUploadDialogOpen}
          linkToModel={linkToModel}
          linkToId={linkToId}
          maxSize={maxSize}
        />
      )}

      <FileEditDialog
        isOpen={isEditDialogOpen}
        onOpenChange={handleEditDialogClose}
        editingFile={editingFile}
        linkToModel={linkToModel}
        linkToId={linkToId}
        isReadOnly={isReadOnly}
      />
    </div>
  );
};

// Export types for external usage
export type {
  FilesManagerProps,
  FileItem,
  FileUploadData,
  FileUpdateData,
} from "./types";

// Default export for backward compatibility
export default FilesManager;
