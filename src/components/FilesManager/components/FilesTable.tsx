/**
 * FilesTable Component
 * Table component for displaying and managing files
 */

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { useFileData, useFileOperations } from "../hooks";
import type { FilesTableProps } from "../types";

export const FilesTable: React.FC<FilesTableProps> = ({
  linkToModel,
  linkToId,
  className = "",
  onEditFile,
}) => {
  const { data: filesData, isLoading } = useFileData(linkToModel, linkToId);
  const { deleteFile, downloadFile, isDeleting } = useFileOperations(
    linkToModel,
    linkToId
  );

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleDownload = async (
    fileId: string,
    fileName: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    await downloadFile(fileId, fileName);
  };

  const handleDelete = (fileId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    deleteFile(fileId);
  };

  if (isLoading) {
    return (
      <div className={`border rounded-lg ${className}`}>
        <div className="text-center py-4">Loading files...</div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg ${className}`}>
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
              <TableRow
                key={file.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onEditFile(file)}
              >
                <TableCell className="font-medium">
                  {file.original_filename}
                </TableCell>
                <TableCell>{file.file_size_human}</TableCell>
                <TableCell>{file.description || "-"}</TableCell>
                <TableCell>{file.tags || "-"}</TableCell>
                <TableCell>{formatDate(file.created_at)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) =>
                        handleDownload(file.id, file.original_filename, e)
                      }
                      title="Download file"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleDelete(file.id, e)}
                      disabled={isDeleting}
                      title="Delete file"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-4 text-muted-foreground"
              >
                No files uploaded yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
