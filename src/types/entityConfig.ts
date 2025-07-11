import { FormField } from "@/components/ApiForm";

export interface EntityTabConfig {
  key: string;
  label: string;
  content?: React.ReactNode;
}

export interface EntityConfig {
  name: string;
  pluralName: string;
  fields: FormField[];
  createEndpoint: string;
  updateEndpoint: (id: string) => string;
  listRoute: string;
  customLayout?: (props: {
    fields: FormField[];
    formData: Record<string, any>;
    handleFieldChange: (name: string, value: any) => void;
    handleSubmit: (e: React.FormEvent) => void;
    loading: boolean;
    error?: string;
    renderField: (field: FormField) => React.ReactNode;
    isEditMode: boolean;
    entityType?: string;
  }) => React.ReactNode;
  tabs?: EntityTabConfig[];
  typeSelection?: {
    enabled: boolean;
    types: Array<{
      key: string;
      label: string;
      buttonText: string;
      fields: FormField[];
      endpoint: string;
    }>;
  };
}