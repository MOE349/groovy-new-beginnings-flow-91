import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { Upload, X, File, CheckCircle } from 'lucide-react';
import { apiCall } from '@/utils/apis';
import { handleApiError } from '@/utils/errorHandling';

interface FileUploadProps {
  multiple?: boolean;
  onFileUploaded?: (fileIds: string[]) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
}

const FileUpload: React.FC<FileUploadProps> = ({
  multiple = false,
  onFileUploaded,
  accept = "*/*",
  maxSize = 10, // 10MB default
  className = ""
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
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

    // Initialize file states
    const newFiles: UploadedFile[] = files.map(file => ({
      id: '',
      name: file.name,
      size: file.size,
      status: 'uploading',
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        try {
          // Update progress
          setUploadedFiles(prev => prev.map((f, index) => 
            index === prev.length - files.length + i 
              ? { ...f, progress: 50 }
              : f
          ));

          const response = await apiCall('/file-uploads/files/', {
            method: 'POST',
            body: formData,
            headers: {} // Let browser set content-type for FormData
          });

          const fileId = response.data?.id || response.data?.data?.id;
          if (fileId) {
            fileIds.push(fileId);
            
            // Update file status to completed
            setUploadedFiles(prev => prev.map((f, index) => 
              index === prev.length - files.length + i 
                ? { ...f, id: fileId, status: 'completed', progress: 100 }
                : f
            ));
          } else {
            throw new Error('No file ID returned from server');
          }
        } catch (error) {
          // Update file status to error
          setUploadedFiles(prev => prev.map((f, index) => 
            index === prev.length - files.length + i 
              ? { ...f, status: 'error', progress: 0 }
              : f
          ));
          handleApiError(error, `Upload failed for ${file.name}`);
        }
      }

      if (fileIds.length > 0) {
        onFileUploaded?.(fileIds);
        toast({
          title: "Upload Successful",
          description: `${fileIds.length} file(s) uploaded successfully`
        });
      }
    } finally {
      setIsUploading(false);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
        
        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground mb-2">
          {multiple ? 'Drop files here or click to select' : 'Drop file here or click to select'}
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          Maximum file size: {maxSize}MB
        </p>
        
        <Button 
          type="button"
          variant="outline" 
          onClick={handleFileSelect}
          disabled={isUploading}
        >
          <Upload className="mr-2 h-4 w-4" />
          {multiple ? 'Select Files' : 'Select File'}
        </Button>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">
            {multiple ? 'Uploaded Files' : 'Uploaded File'}
          </h4>
          
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {file.status === 'completed' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : file.status === 'error' ? (
                    <X className="h-4 w-4 text-red-500" />
                  ) : (
                    <File className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                  
                  {file.status === 'uploading' && (
                    <Progress value={file.progress} className="w-full h-1 mt-1" />
                  )}
                </div>
              </div>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="flex-shrink-0 ml-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;