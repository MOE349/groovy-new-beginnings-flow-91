/**
 * SimpleFileUploadZone Component
 * Standalone file upload without database management - for legacy compatibility
 */

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { Upload, X, File, CheckCircle } from "lucide-react";
import { apiCall } from "@/utils/apis";
import { handleApiError } from "@/utils/errorHandling";

interface SimpleFileUploadZoneProps {
  maxSize: number; // in MB
  multiple?: boolean;
  accept?: string;
  onFileUploaded?: (fileIds: string[]) => void;
  className?: string;
}

interface UploadingFile {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
}

export const SimpleFileUploadZone: React.FC<SimpleFileUploadZoneProps> = ({
  maxSize,
  multiple = true,
  accept = "*/*",
  onFileUploaded,
  className = "",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (fileId: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate file sizes
    const oversizedFiles = files.filter(file => file.size > maxSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: "File Size Error",
        description: `Some files exceed the ${maxSize}MB limit`,
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    const fileIds: string[] = [];

    // Initialize uploading file states
    const newFiles: UploadingFile[] = files.map((file, index) => ({
      id: `temp_${Date.now()}_${index}`,
      name: file.name,
      size: file.size,
      status: 'uploading',
      progress: 0
    }));

    setUploadingFiles(prev => [...prev, ...newFiles]);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const tempId = newFiles[i].id;
        
        try {
          // Update progress to show upload started
          setUploadingFiles(prev => 
            prev.map(f => f.id === tempId ? { ...f, progress: 25 } : f)
          );

          const formData = new FormData();
          formData.append('file', file);

          // Use apiCall for consistency with the rest of the app
          const response = await apiCall('/file-uploads/files/', {
            method: 'POST',
            body: formData,
          });

          const fileId = response.data?.data?.id || response.data?.id || response.id;

          if (fileId) {
            fileIds.push(fileId);
            
            // Update to completed
            setUploadingFiles(prev => 
              prev.map(f => f.id === tempId ? { 
                ...f, 
                id: fileId,
                status: 'completed', 
                progress: 100 
              } : f)
            );
          } else {
            throw new Error('No file ID returned from server');
          }
        } catch (error) {
          // Update to error state
          setUploadingFiles(prev => 
            prev.map(f => f.id === tempId ? { 
              ...f, 
              status: 'error', 
              progress: 0 
            } : f)
          );
          handleApiError(error, `Upload failed for ${file.name}`);
        }
      }

      if (fileIds.length > 0) {
        onFileUploaded?.(fileIds);
        toast({
          title: "Upload Successful",
          description: `${fileIds.length} file(s) uploaded successfully`
        });

        // Clear completed files after a short delay
        setTimeout(() => {
          setUploadingFiles(prev => prev.filter(f => f.status === 'error'));
        }, 2000);
      }
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />

      {/* Upload Zone */}
      <div 
        className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
        onClick={!isUploading ? handleFileSelect : undefined}
      >
        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground mb-2">
          Drop files here or click to select
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          Maximum file size: {maxSize}MB
          {!multiple && " (single file only)"}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={handleFileSelect}
          disabled={isUploading}
        >
          <Upload className="mr-2 h-4 w-4" />
          Select Files
        </Button>
      </div>

      {/* Uploading Files Display */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Files</h4>
          {uploadingFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 border rounded-lg bg-background"
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
              {(file.status === "error" || file.status === "completed") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleFileUploadZone;
