import React from "react";
import { useNavigate } from "react-router-dom";
import ApiForm, {
  type ApiFormProps,
  type CustomLayoutProps,
} from "@/components/ApiForm";
import { toast } from "@/hooks/use-toast";
import { apiCall, type ApiResponse } from "@/services/api";

type ExtractIdFn<T = unknown> = (
  response: ApiResponse<T>
) => string | number | undefined;

export interface CreateEntityFormPageProps<
  TForm extends Record<string, unknown> = Record<string, unknown>,
  TResp = unknown,
> {
  // ApiForm core props
  fields: ApiFormProps<TForm>["fields"];
  // Optional: provide a FormLayoutConfig to derive fields if you prefer config-driven fields
  // Note: to enable this, add a mapper utility and replace fields with derived ones
  // config?: FormLayoutConfig;
  initialData?: ApiFormProps<TForm>["initialData"];
  schema?: ApiFormProps<TForm>["schema"];
  layout?: ApiFormProps<TForm>["layout"];
  columns?: ApiFormProps<TForm>["columns"];
  customFormLayout?: (props: CustomLayoutProps<TForm>) => React.ReactNode;
  submitText?: string;
  cancelText?: string;
  className?: string;
  formClassName?: string;

  // Endpoint for creating the entity (POST)
  createEndpoint: string;

  // Navigate to edit page on success
  getEditRoute: (id: string) => string;

  // Optional hooks
  onSuccessToast?: { title?: string; description?: string };
  extractId?: ExtractIdFn<TResp>;
  afterSuccess?: (createdId?: string) => void;
}

const defaultExtractId: ExtractIdFn = (response) => {
  const body = response?.data as any;
  if (!body) return undefined;
  // Prefer object.data.id
  if (
    body.data &&
    typeof body.data === "object" &&
    !Array.isArray(body.data) &&
    body.data.id
  ) {
    return String(body.data.id);
  }
  // If data is array, take first
  if (Array.isArray(body.data) && body.data[0]?.id) {
    return String(body.data[0].id);
  }
  // Fallback: top-level id
  if (body.id) return String(body.id);
  return undefined;
};

export function CreateEntityFormPage<
  TForm extends Record<string, unknown> = Record<string, unknown>,
  TResp = unknown,
>({
  fields,
  initialData,
  schema,
  layout = "vertical",
  columns = 1,
  customFormLayout,
  submitText = "Save",
  cancelText = "Cancel",
  className,
  formClassName,
  createEndpoint,
  getEditRoute,
  onSuccessToast,
  extractId = defaultExtractId as ExtractIdFn<TResp>,
  afterSuccess,
}: CreateEntityFormPageProps<TForm, TResp>) {
  const navigate = useNavigate();

  const handleSubmit: ApiFormProps<TForm>["onSubmit"] = async (data) => {
    const response = await apiCall<TResp>(createEndpoint, {
      method: "POST",
      body: data as Record<string, unknown>,
    });
    const createdId = (extractId as ExtractIdFn<TResp>)(response);

    if (!createdId) {
      toast({
        title: "Saved",
        description: onSuccessToast?.description || "Created successfully",
      });
      afterSuccess?.(undefined);
      return;
    }

    toast({
      title: onSuccessToast?.title || "Success",
      description: onSuccessToast?.description || "Created successfully",
    });
    afterSuccess?.(String(createdId));
    navigate(getEditRoute(String(createdId)));
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

export default CreateEntityFormPage;
