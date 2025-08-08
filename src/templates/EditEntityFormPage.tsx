import React from "react";
import ApiForm, {
  type ApiFormProps,
  type CustomLayoutProps,
} from "@/components/ApiForm";
import { apiCall } from "@/services/api";
import { toast } from "@/hooks/use-toast";

export interface EditEntityFormPageProps<
  TForm extends Record<string, unknown> = Record<string, unknown>,
> {
  // ApiForm core props
  fields: ApiFormProps<TForm>["fields"];
  initialData?: ApiFormProps<TForm>["initialData"];
  schema?: ApiFormProps<TForm>["schema"];
  layout?: ApiFormProps<TForm>["layout"];
  columns?: ApiFormProps<TForm>["columns"];
  customFormLayout?: (props: CustomLayoutProps<TForm>) => React.ReactNode;
  submitText?: string;
  cancelText?: string;
  className?: string;
  formClassName?: string;

  // Endpoint for updating the entity (PATCH)
  updateEndpoint: string;

  // Optional hooks
  onSuccessToast?: { title?: string; description?: string };
  afterSuccess?: () => void;
}

export function EditEntityFormPage<
  TForm extends Record<string, unknown> = Record<string, unknown>,
>({
  fields,
  initialData,
  schema,
  layout = "vertical",
  columns = 1,
  customFormLayout,
  submitText = "Update",
  cancelText = "Cancel",
  className,
  formClassName,
  updateEndpoint,
  onSuccessToast,
  afterSuccess,
}: EditEntityFormPageProps<TForm>) {
  const handleSubmit: ApiFormProps<TForm>["onSubmit"] = async (data) => {
    await apiCall(updateEndpoint, {
      method: "PATCH",
      body: data as Record<string, unknown>,
    });
    toast({
      title: onSuccessToast?.title || "Success",
      description: onSuccessToast?.description || "Updated successfully",
    });
    afterSuccess?.();
  };

  const formProps: ApiFormProps<TForm> = {
    fields,
    schema,
    initialData: initialData as Record<string, unknown> | undefined,
    onSubmit: handleSubmit,
    submitText,
    cancelText,
    layout,
    columns,
    className,
    formClassName,
    ...(customFormLayout ? { customLayout: customFormLayout } : {}),
  };

  return <ApiForm {...formProps} />;
}

export default EditEntityFormPage;
