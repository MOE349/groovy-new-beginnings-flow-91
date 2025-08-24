/**
 * FileUploadDialog Component
 * Modal dialog for uploading files with metadata
 */

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, X, File } from "lucide-react";
import { FileUploadZone } from "./FileUploadZone";
import { useFileUpload } from "../hooks";
import type { FileUploadDialogProps } from "../types";

export const FileUploadDialog: React.FC<FileUploadDialogProps> = ({
  isOpen,
  onOpenChange,
  linkToModel,
  linkToId,
  maxSize,
}) => {
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [setAsDefaultImage, setSetAsDefaultImage] = useState(false);

  const { uploadFiles, uploadedFiles, isUploading, resetUpload } =
    useFileUpload(linkToModel, linkToId);

  const handleFileSelect = async (files: File[]) => {
    const success = await uploadFiles(
      files,
      { description, tags, setAsDefaultImage },
      maxSize
    );

    if (success) {
      // Clear form and close dialog
      setDescription("");
      setTags("");
      setSetAsDefaultImage(false);
      onOpenChange(false);
    }
  };

  const handleDialogChange = (open: boolean) => {
    if (!open && !isUploading) {
      resetUpload();
      setDescription("");
      setTags("");
      setSetAsDefaultImage(false);
    }
    onOpenChange(open);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter file description"
              className="mt-1"
              disabled={isUploading}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Tags</label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="manual,maintenance"
              className="mt-1"
              disabled={isUploading}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="set-default-image"
              checked={setAsDefaultImage}
              onCheckedChange={setSetAsDefaultImage}
              disabled={isUploading}
            />
            <label htmlFor="set-default-image" className="text-sm font-medium">
              Set as default image (for image files only)
            </label>
          </div>

          <FileUploadZone
            onFileSelect={handleFileSelect}
            maxSize={maxSize}
            isUploading={isUploading}
          />

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Uploading Files</h4>
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {file.status === "completed" ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : file.status === "error" ? (
                        <X className="h-4 w-4 text-red-500" />
                      ) : (
                        <File className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                      {file.status === "uploading" && (
                        <Progress
                          value={file.progress}
                          className="w-full h-1 mt-1"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
