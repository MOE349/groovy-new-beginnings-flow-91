/**
 * FilesManager Types
 * Shared type definitions for the modular FilesManager component system
 */

export interface FilesManagerProps {
  linkToModel: string;
  linkToId: string;
  maxSize?: number; // in MB
  className?: string;
}

export interface FileItem {
  id: string;
  original_filename: string;
  file_size: number;
  file_size_human: string;
  content_type: string;
  description?: string;
  tags?: string;
  is_image: boolean;
  is_document: boolean;
  file_url: string;
  download_url: string;
  created_at: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: "uploading" | "completed" | "error";
  progress: number;
}

export interface FileUploadData {
  description: string;
  tags: string;
  setAsDefaultImage: boolean;
}

export interface FileUpdateData {
  fileId: string;
  description: string;
  tags: string;
  setAsDefaultImage?: boolean;
  isImage?: boolean;
}

export interface FileUploadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  linkToModel: string;
  linkToId: string;
  maxSize: number;
}

export interface FileEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingFile: FileItem | null;
  linkToModel: string;
  linkToId: string;
}

export interface FilesTableProps {
  linkToModel: string;
  linkToId: string;
  className?: string;
  onEditFile: (file: FileItem) => void;
}

export interface FileUploadZoneProps {
  onFileSelect: (files: File[]) => void;
  maxSize: number;
  isUploading: boolean;
}

export interface FileActionsProps {
  file: FileItem;
  onEdit: (file: FileItem) => void;
  onDelete: (fileId: string) => void;
  isDeleting?: boolean;
}
