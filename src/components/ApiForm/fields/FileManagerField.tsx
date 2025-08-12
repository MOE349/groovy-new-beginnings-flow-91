/**
 * FileManagerField Component
 * File manager field for ApiForm with full upload/download/management capabilities
 */

import React from "react";
import { FieldValues } from "react-hook-form";
import { Label } from "@/components/ui/label";
import FilesManager from "@/components/FilesManager";
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

  // Don't render file manager if no linkToId is provided (for new records)
  if (!linkToId) {
    return (
      <div className={`space-y-2 ${className || ""}`}>
        {label && <Label htmlFor={name}>{label}</Label>}
        <div className="p-4 border rounded-lg bg-muted/50 text-center text-muted-foreground">
          File management will be available after saving this record.
        </div>
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
        />
      </div>
    </div>
  );
}

export default FileManagerField;
