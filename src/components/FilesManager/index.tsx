/**
 * FilesManager Component
 * Modular, performant file management with upload/download/edit capabilities
 */

import React, { useState } from "react";
import { FileUploadDialog, FileEditDialog, FilesTable } from "./components";
import type { FilesManagerProps, FileItem } from "./types";

export const FilesManager: React.FC<FilesManagerProps> = ({
  linkToModel,
  linkToId,
  maxSize = 10,
  className = "",
}) => {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<FileItem | null>(null);

  const handleEditFile = (file: FileItem) => {
    setEditingFile(file);
    setIsEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setEditingFile(null);
  };

  return (
    <div className={className}>
      <FilesTable
        linkToModel={linkToModel}
        linkToId={linkToId}
        onEditFile={handleEditFile}
        onCreateNew={() => setIsUploadDialogOpen(true)}
      />

      <FileUploadDialog
        isOpen={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        linkToModel={linkToModel}
        linkToId={linkToId}
        maxSize={maxSize}
      />

      <FileEditDialog
        isOpen={isEditDialogOpen}
        onOpenChange={handleEditDialogClose}
        editingFile={editingFile}
        linkToModel={linkToModel}
        linkToId={linkToId}
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
