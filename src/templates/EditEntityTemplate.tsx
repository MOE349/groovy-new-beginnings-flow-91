import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EditEntityFormPage } from "@/templates/EditEntityFormPage";
import { EntityTabs } from "@/components/EntityTabs";
import GearSpinner from "@/components/ui/gear-spinner";
import { AlertTriangle } from "lucide-react";
import type { CustomLayoutProps } from "@/components/ApiForm";

// Base entity configuration interface
export interface EntityConfig<TData = any, TInitialData = any> {
  // Entity identification
  entityName: string;
  entityDisplayName: string;

  // Data fetching
  useEntityData: (id: string) => {
    data: TData | null;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
  };

  // Form configuration
  getFields: (data: TData) => any[];
  getUpdateEndpoint: (id: string, data: TData) => string;
  getInitialData: (data: TData) => TInitialData;
  getCustomLayout?: (
    data: TData
  ) => (props: CustomLayoutProps<Record<string, unknown>>) => JSX.Element;

  // Tab configuration
  getTabs: (
    id: string,
    data: TData
  ) => Array<{
    id: string;
    label: string;
    content: JSX.Element;
    onMouseEnter?: () => void;
    onTabChange?: () => void;
  }>;

  // Optional performance optimizations
  onMount?: (id: string) => void;

  // Optional custom validation
  validateData?: (data: TData) => boolean;

  // Default tab
  defaultTab?: string;
}

interface EditEntityTemplateProps<TData = any, TInitialData = any> {
  config: EntityConfig<TData, TInitialData>;
}

export const EditEntityTemplate = <TData = any, TInitialData = any>({
  config,
}: EditEntityTemplateProps<TData, TInitialData>) => {
  const { id } = useParams();

  // Use entity-specific data hook
  const { data, isLoading, isError, error } = config.useEntityData(id || "");

  // Handle mount lifecycle
  useEffect(() => {
    if (id && config.onMount) {
      config.onMount(id);
    }
  }, [id, config]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <GearSpinner fullscreen />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load {config.entityDisplayName.toLowerCase()} data:{" "}
            {error?.message || "Unknown error"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Data validation
  if (!data || (config.validateData && !config.validateData(data))) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <GearSpinner fullscreen />
      </div>
    );
  }

  // Get entity-specific configurations
  const fields = config.getFields(data);
  const updateEndpoint = config.getUpdateEndpoint(id || "", data);
  const initialData = config.getInitialData(data);
  const customLayout = config.getCustomLayout?.(data);
  const tabs = config.getTabs(id || "", data);

  return (
    <div className="h-full w-full max-w-full overflow-hidden flex flex-col">
      {/* Form Section */}
      <div className="flex-shrink-0 overflow-x-auto">
        <div className="min-w-[1440px] w-full">
          <EditEntityFormPage
            fields={fields}
            initialData={initialData}
            updateEndpoint={updateEndpoint}
            customFormLayout={customLayout}
            onSuccessToast={{
              description: `${config.entityDisplayName} updated successfully!`,
            }}
          />
        </div>
      </div>

      {/* Tabs Section - Uses all remaining space */}
      <div className="flex-1 flex flex-col w-full max-w-full overflow-hidden">
        <EntityTabs
          defaultValue={config.defaultTab || tabs[0]?.id}
          tabs={tabs}
        />
      </div>
    </div>
  );
};

export default EditEntityTemplate;
