import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Upload, X, File, CheckCircle, Download, Trash2 } from 'lucide-react';
import { apiCall } from '@/utils/apis';
import { handleApiError } from '@/utils/errorHandling';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface FilesManagerProps {
  linkToModel: string;
  linkToId: string;
  maxSize?: number; // in MB
  className?: string;
}

interface FileItem {
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

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
}

const FilesManager: React.FC<FilesManagerProps> = ({
  linkToModel,
  linkToId,
  maxSize = 10,
  className = ""
}) => {
  const queryClient = useQueryClient();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [setAsDefaultImage, setSetAsDefaultImage] = useState(false);

  // Fetch files
  const { data: filesData, isLoading } = useQuery({
    queryKey: ['files', linkToModel, linkToId],
    queryFn: async () => {
      const response = await apiCall(`/file-uploads/files/?link_to_model=${linkToModel}&object_id=${linkToId}`);
      return response.data.data as FileItem[];
    }
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      await apiCall(`/file-uploads/files/${fileId}/`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', linkToModel, linkToId] });
      toast({
        title: "File Deleted",
        description: "File has been successfully deleted"
      });
    },
    onError: (error) => {
      handleApiError(error, "Failed to delete file");
    }
  });

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
        formData.append('link_to_model', linkToModel);
        formData.append('link_to_id', linkToId);
        if (description) formData.append('description', description);
        if (tags) formData.append('tags', tags);

        try {
          // Update progress
          setUploadedFiles(prev => prev.map((f, index) => 
            index === prev.length - files.length + i 
              ? { ...f, progress: 50 }
              : f
          ));

          const token = localStorage.getItem('access_token');
          const apiUrl = 'https://tenmil.api.alfrih.com/v1/api/file-uploads/files/';
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              ...(token && { 'Authorization': `Bearer ${token}` }),
            },
            body: formData
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          const fileId = result.data?.id || result.id;
          
          if (fileId) {
            // Update file status to completed
            setUploadedFiles(prev => prev.map((f, index) => 
              index === prev.length - files.length + i 
                ? { ...f, id: fileId, status: 'completed', progress: 100 }
                : f
            ));

            // Set as default image if toggle is checked and file is an image
            if (setAsDefaultImage && file.type.startsWith('image/')) {
              try {
                const assetType = linkToModel.includes('equipment') ? 'equipments' : 'attachments';
                await apiCall(`/${assetType}/${linkToId}/set-image/`, {
                  method: 'POST',
                  body: { file_id: fileId }
                });
                
                toast({
                  title: "Default Image Set",
                  description: "Image has been set as the default for this asset"
                });
              } catch (imageError) {
                handleApiError(imageError, "Failed to set default image");
              }
            }
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

      // Refresh the files list
      queryClient.invalidateQueries({ queryKey: ['files', linkToModel, linkToId] });
      
      toast({
        title: "Upload Successful",
        description: `${files.length} file(s) uploaded successfully`
      });

      // Clear form
      setDescription('');
      setTags('');
      setSetAsDefaultImage(false);
      setIsUploadDialogOpen(false);
    } finally {
      setIsUploading(false);
      setUploadedFiles([]);
    }
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`https://tenmil.api.alfrih.com/v1/api/file-uploads/files/${fileId}/download/`, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      handleApiError(error, "Failed to download file");
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
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
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tags</label>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="manual,maintenance"
                  className="mt-1"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="set-default-image"
                  checked={setAsDefaultImage}
                  onCheckedChange={setSetAsDefaultImage}
                />
                <label htmlFor="set-default-image" className="text-sm font-medium">
                  Set as default image (for image files only)
                </label>
              </div>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
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
                  onClick={() => document.getElementById('file-upload')?.click()}
                  disabled={isUploading}
                  asChild
                >
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Select Files
                  </label>
                </Button>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Uploading Files</h4>
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading files...</div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filesData && filesData.length > 0 ? (
                filesData.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">{file.original_filename}</TableCell>
                    <TableCell>{file.file_size_human}</TableCell>
                    <TableCell>{file.description || '-'}</TableCell>
                    <TableCell>{file.tags || '-'}</TableCell>
                    <TableCell>{formatDate(file.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(file.id, file.original_filename)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteFileMutation.mutate(file.id)}
                          disabled={deleteFileMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    No files uploaded yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default FilesManager;