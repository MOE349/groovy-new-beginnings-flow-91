/**
 * FilesManager Component
 * Modular, performant file management with upload/download/edit capabilities
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
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
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Files</h3>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Files
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      <FilesTable
        linkToModel={linkToModel}
        linkToId={linkToId}
        onEditFile={handleEditFile}
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
