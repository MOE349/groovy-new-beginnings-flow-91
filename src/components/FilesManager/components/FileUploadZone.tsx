/**
 * FileUploadZone Component
 * Drag and drop file upload zone with file selection
 */

import React from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import type { FileUploadZoneProps } from "../types";

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFileSelect,
  maxSize,
  isUploading,
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("FileUploadZone: File input changed");
    const files = Array.from(event.target.files || []);
    console.log("FileUploadZone: Selected files:", files);
    if (files.length > 0) {
      console.log(
        "FileUploadZone: Calling onFileSelect with",
        files.length,
        "files"
      );
      onFileSelect(files);
    }
    // Reset input value to allow selecting the same file again
    event.target.value = "";
  };

  return (
    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
        disabled={isUploading}
      />
      <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
      <p className="text-sm text-muted-foreground mb-2">
        Drop files here or click to select
      </p>
      <p className="text-xs text-muted-foreground mb-4">
        Maximum file size: {maxSize}MB
      </p>
      <Button
        type="button"
        variant="outline"
        onClick={() => document.getElementById("file-upload")?.click()}
        disabled={isUploading}
      >
        <Upload className="mr-2 h-4 w-4" />
        Select Files
      </Button>
    </div>
  );
};
