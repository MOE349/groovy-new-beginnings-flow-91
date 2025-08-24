/**
 * FileManagerField Component
 * File manager field for ApiForm with full upload/download/management capabilities
 * Supports temporary file storage for creation forms
 */

import React, { useEffect } from "react";
import { FieldValues } from "react-hook-form";
import { Label } from "@/components/ui/label";
import FilesManager from "@/components/FilesManager";
import PendingFileManager, { PendingFile } from "./PendingFileManager";
import type { FieldProps, FileManagerFieldConfig } from "../types";

interface FileManagerFieldProps<T extends FieldValues = FieldValues>
  extends FieldProps<T> {
  field: FileManagerFieldConfig;
}

export function FileManagerField<T extends FieldValues = FieldValues>({
  field,
  form,
  name,
}: FileManagerFieldProps<T>) {
  const {
    label,
    linkToModel = "components.component",
    linkToId,
    maxSize = 25,
    className,
  } = field;

  // Handle pending files change
  const handlePendingFilesChange = (pendingFiles: PendingFile[]) => {
    form.setValue(name, pendingFiles);
  };

  // Initialize form value if not set
  useEffect(() => {
    if (!linkToId && !form.getValues(name)) {
      form.setValue(name, []);
    }
  }, [linkToId, form, name]);

  // Use PendingFileManager for creation forms (no linkToId)
  if (!linkToId) {
    return (
      <div className={`space-y-2 ${className || ""}`}>
        {label && <Label htmlFor={name}>{label}</Label>}
        <PendingFileManager
          maxSize={maxSize}
          className="w-full"
          onChange={handlePendingFilesChange}
          disabled={field.disabled}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className || ""}`}>
      {label && <Label htmlFor={name}>{label}</Label>}
      <div>
        <FilesManager
          linkToModel={linkToModel}
          linkToId={linkToId}
          maxSize={maxSize}
          className="w-full"
          isReadOnly={field.disabled}
        />
      </div>
    </div>
  );
}

export default FileManagerField;
