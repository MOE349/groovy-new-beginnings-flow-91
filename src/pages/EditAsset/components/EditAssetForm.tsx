/**
 * EditAssetForm Component
 * Separated form logic for better performance
 */

import React from "react";
import ApiForm from "@/components/ApiForm";
import FormLayout from "@/components/FormLayout";
import { equipmentFields, attachmentFields } from "@/data/assetFormFields";
import {
  equipmentFormConfig,
  attachmentFormConfig,
} from "@/config/formLayouts";

interface EditAssetFormProps {
  assetType: "equipment" | "attachment";
  assetData: any;
  onSubmit: (data: any) => Promise<void>;
}

export const EditAssetForm = React.memo<EditAssetFormProps>(({
  assetType,
  assetData,
  onSubmit,
}) => {
  const currentFields = assetType === "equipment" ? equipmentFields : attachmentFields;

  const initialData = React.useMemo(() => ({
    ...assetData,
    category: assetData?.category?.id || assetData?.category || "",
    location: assetData?.location?.id || assetData?.location || "",
    weight_class: assetData?.weight_class?.id || assetData?.weight_class || "",
    year: assetData?.year ? assetData.year.toString() : "",
    equipment: assetData?.equipment?.id || assetData?.equipment || "",
    project: assetData?.project?.id || assetData?.project || "",
    account_code: assetData?.account_code?.id || assetData?.account_code || "",
    job_code: assetData?.job_code?.id || assetData?.job_code || "",
    asset_status: assetData?.asset_status?.id || assetData?.asset_status || "",
  }), [assetData]);

  const customLayout = React.useCallback((props: any) => (
    <FormLayout
      {...props}
      config={
        assetType === "attachment" ? attachmentFormConfig : equipmentFormConfig
      }
    />
  ), [assetType]);

  return (
    <div>
      <ApiForm
        fields={currentFields}
        onSubmit={onSubmit}
        initialData={initialData}
        customLayout={customLayout}
      />
    </div>
  );
});

EditAssetForm.displayName = "EditAssetForm";