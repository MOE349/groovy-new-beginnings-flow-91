import React from "react";
import { CreateEntityFormPage } from "@/templates/CreateEntityFormPage";
import { EntityTabs } from "@/components/EntityTabs";
import type { CustomLayoutProps } from "@/components/ApiForm";

// Base create entity configuration interface
export interface CreateEntityConfig {
  // Entity identification
  entityName: string;
  entityDisplayName: string;

  // Form configuration
  getFields: () => any[];
  getCreateEndpoint: () => string;
  getInitialData: () => Record<string, unknown>;
  getEditRoute: (id: string) => string;
  getCustomLayout?: () => (
    props: CustomLayoutProps<Record<string, unknown>>
  ) => JSX.Element;

  // Tab configuration for create pages (mostly placeholders)
  getTabs: () => Array<{
    id: string;
    label: string;
    content: JSX.Element;
  }>;

  // Default tab
  defaultTab?: string;
}

interface CreateEntityTemplateProps {
  config: CreateEntityConfig;
}

export const CreateEntityTemplate: React.FC<CreateEntityTemplateProps> = ({
  config,
}) => {
  // Get entity-specific configurations
  const fields = config.getFields();
  const createEndpoint = config.getCreateEndpoint();
  const initialData = config.getInitialData();
  const getEditRoute = config.getEditRoute;
  const customLayout = config.getCustomLayout?.();
  const tabs = config.getTabs();

  return (
    <div className="h-full w-full max-w-full overflow-hidden flex flex-col">
      {/* Form Section */}
      <div className="flex-shrink-0 overflow-x-auto">
        <div className="min-w-[1440px] w-full">
          <CreateEntityFormPage
            fields={fields}
            initialData={initialData}
            createEndpoint={createEndpoint}
            getEditRoute={getEditRoute}
            customFormLayout={customLayout}
            onSuccessToast={{
              description: `${config.entityDisplayName} created successfully!`,
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

export default CreateEntityTemplate;
