/**
 * FileEditDialog Component
 * Modal dialog for editing file metadata
 */

import React, { useState, useEffect } from "react";
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
import { Edit } from "lucide-react";
import { useFileOperations } from "../hooks";
import type { FileEditDialogProps } from "../types";

export const FileEditDialog: React.FC<FileEditDialogProps> = ({
  isOpen,
  onOpenChange,
  editingFile,
  linkToModel,
  linkToId,
  isReadOnly = false,
}) => {
  const [editDescription, setEditDescription] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editSetAsDefaultImage, setEditSetAsDefaultImage] = useState(false);

  const { updateFile, isUpdating } = useFileOperations(linkToModel, linkToId);

  // Reset form when file changes or dialog opens
  useEffect(() => {
    if (editingFile) {
      setEditDescription(editingFile.description || "");
      setEditTags(editingFile.tags || "");
      setEditSetAsDefaultImage(false);
    }
  }, [editingFile]);

  const handleUpdateFile = () => {
    if (!editingFile) return;

    updateFile({
      fileId: editingFile.id,
      description: editDescription,
      tags: editTags,
      setAsDefaultImage: editSetAsDefaultImage,
      isImage: editingFile.is_image,
    });

    onOpenChange(false);
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setEditDescription("");
      setEditTags("");
      setEditSetAsDefaultImage(false);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isReadOnly ? "View File Details" : "Edit File"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">File Name</label>
            <Input
              value={editingFile?.original_filename || ""}
              disabled
              className="mt-1 bg-muted"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Enter file description"
              className="mt-1"
              disabled={isUpdating || isReadOnly}
              readOnly={isReadOnly}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Tags</label>
            <Input
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              placeholder="manual,maintenance"
              className="mt-1"
              disabled={isUpdating || isReadOnly}
              readOnly={isReadOnly}
            />
          </div>
          {editingFile?.is_image && (
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-set-default-image"
                checked={editSetAsDefaultImage}
                onCheckedChange={setEditSetAsDefaultImage}
                disabled={isUpdating || isReadOnly}
              />
              <label
                htmlFor="edit-set-default-image"
                className="text-sm font-medium"
              >
                Set as default image for this asset
              </label>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
            >
              {isReadOnly ? "Close" : "Cancel"}
            </Button>
            {!isReadOnly && (
              <Button onClick={handleUpdateFile} disabled={isUpdating}>
                <Edit className="mr-2 h-4 w-4" />
                Update File
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
