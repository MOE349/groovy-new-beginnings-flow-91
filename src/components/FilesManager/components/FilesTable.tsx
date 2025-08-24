/**
 * FilesTable Component
 * Table component for displaying and managing files using ApiTable
 */

import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import ApiTable, { TableColumn } from "@/components/ApiTable";
import { useFileOperations } from "../hooks";
import type { FilesTableProps, FileItem } from "../types";

export const FilesTable: React.FC<FilesTableProps> = ({
  linkToModel,
  linkToId,
  className = "",
  onEditFile,
  onCreateNew,
  isReadOnly = false,
}) => {
  const { deleteFile, downloadFile, isDeleting } = useFileOperations(
    linkToModel,
    linkToId
  );

  const columns: TableColumn<FileItem>[] = [
    {
      key: "original_filename",
      header: "Name",
      className: "font-medium",
    },
    {
      key: "file_size_human",
      header: "Size",
    },
    {
      key: "description",
      header: "Description",
      render: (value) => (value as string) || "-",
    },
    {
      key: "tags",
      header: "Tags",
      render: (value) => (value as string) || "-",
    },
    {
      key: "created_at",
      header: "Upload Date",
      type: "date",
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, file) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              downloadFile(file.id, file.original_filename);
            }}
            title="Download file"
          >
            <Download className="h-4 w-4" />
          </Button>
          {!isReadOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                deleteFile(file.id);
              }}
              disabled={isDeleting}
              title="Delete file"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  return (
    <ApiTable<FileItem>
      endpoint={`/file-uploads/files/?link_to_model=${linkToModel}&object_id=${linkToId}`}
      columns={columns}
      queryKey={["files", linkToModel, linkToId]}
      emptyMessage="No files uploaded yet"
      onRowClick={onEditFile}
      hasCreateButton={!isReadOnly}
      createNewText="Upload Files"
      onCreateNew={(e?: React.MouseEvent) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        onCreateNew();
      }}
      showFilters={false}
      className={className}
      tableId={`files-${linkToModel}-${linkToId}`}
    />
  );
};
