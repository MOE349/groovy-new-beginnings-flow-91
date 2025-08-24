/**
 * PendingFileManager Component
 * Temporary file storage component for creation forms where linkToId is not yet available
 */

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileUploadZone } from "@/components/FilesManager/components";
import { X, FileIcon, ImageIcon, Download, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PendingFile {
  id: string;
  file: File;
  description?: string;
  tags?: string;
}

export interface PendingFileManagerProps {
  maxSize?: number; // in MB
  className?: string;
  onChange?: (files: PendingFile[]) => void;
  disabled?: boolean;
}

export const PendingFileManager: React.FC<PendingFileManagerProps> = ({
  maxSize = 25,
  className = "",
  onChange,
  disabled = false,
}) => {
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const generateId = () =>
    `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileSelect = useCallback(
    async (files: File[]) => {
      setIsUploading(true);

      try {
        const newPendingFiles: PendingFile[] = files.map((file) => ({
          id: generateId(),
          file,
          description: "",
          tags: "",
        }));

        const updatedFiles = [...pendingFiles, ...newPendingFiles];
        setPendingFiles(updatedFiles);
        onChange?.(updatedFiles);
      } catch (error) {
        console.error("Error selecting files:", error);
      } finally {
        setIsUploading(false);
      }
    },
    [pendingFiles, onChange]
  );

  const handleRemoveFile = useCallback(
    (fileId: string) => {
      const updatedFiles = pendingFiles.filter((f) => f.id !== fileId);
      setPendingFiles(updatedFiles);
      onChange?.(updatedFiles);
    },
    [pendingFiles, onChange]
  );

  const handleDescriptionChange = useCallback(
    (fileId: string, description: string) => {
      const updatedFiles = pendingFiles.map((f) =>
        f.id === fileId ? { ...f, description } : f
      );
      setPendingFiles(updatedFiles);
      onChange?.(updatedFiles);
    },
    [pendingFiles, onChange]
  );

  const handleTagsChange = useCallback(
    (fileId: string, tags: string) => {
      const updatedFiles = pendingFiles.map((f) =>
        f.id === fileId ? { ...f, tags } : f
      );
      setPendingFiles(updatedFiles);
      onChange?.(updatedFiles);
    },
    [pendingFiles, onChange]
  );

  const isImageFile = (file: File): boolean => {
    return file.type.startsWith("image/");
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Zone */}
      {!disabled && (
        <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
          <CardContent className="p-4">
            <FileUploadZone
              onFileSelect={handleFileSelect}
              maxSize={maxSize}
              isUploading={isUploading}
            />
          </CardContent>
        </Card>
      )}

      {/* Pending Files List */}
      {pendingFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              Files to upload ({pendingFiles.length})
            </span>
            <Badge variant="secondary" className="text-xs">
              Pending
            </Badge>
          </div>

          {pendingFiles.map((pendingFile) => (
            <Card
              key={pendingFile.id}
              className="border-orange-200 bg-orange-50/50"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* File Icon */}
                  <div className="flex-shrink-0">
                    {isImageFile(pendingFile.file) ? (
                      <ImageIcon className="h-8 w-8 text-blue-500" />
                    ) : (
                      <FileIcon className="h-8 w-8 text-gray-500" />
                    )}
                  </div>

                  {/* File Details */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm truncate">
                          {pendingFile.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(pendingFile.file.size)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      {!disabled && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(pendingFile.id)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Description Input */}
                    <input
                      type="text"
                      placeholder="Add description (optional)"
                      value={pendingFile.description || ""}
                      onChange={(e) =>
                        handleDescriptionChange(pendingFile.id, e.target.value)
                      }
                      disabled={disabled}
                      className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:bg-muted disabled:text-muted-foreground"
                    />

                    {/* Tags Input */}
                    <input
                      type="text"
                      placeholder="Add tags (optional, comma-separated)"
                      value={pendingFile.tags || ""}
                      onChange={(e) =>
                        handleTagsChange(pendingFile.id, e.target.value)
                      }
                      disabled={disabled}
                      className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:bg-muted disabled:text-muted-foreground"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {pendingFiles.length > 0 && (
            <div className="text-xs text-muted-foreground bg-orange-50 border border-orange-200 rounded-lg p-3">
              📝 <strong>Note:</strong> These files will be uploaded after the
              record is successfully created.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PendingFileManager;
