
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X } from "lucide-react";

export interface FormLayoutConfig {
  title: string;
  backRoute: string;
  showImage?: boolean;
  showOnlineToggle?: boolean;
  showSpecialSections?: {
    location?: boolean;
    equipment?: boolean;
  };
  columns: FormColumnConfig[];
}

export interface FormColumnConfig {
  fields: FormFieldConfig[];
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  inputType?: string;
  rows?: number;
  endpoint?: string;
  queryKey?: string[];
  optionValueKey?: string;
  optionLabelKey?: string;
  options?: Array<{ id: string; name: string }>;
}

interface FormLayoutProps {
  handleSubmit: () => void;
  formData: Record<string, any>;
  handleFieldChange: (field: string, value: any) => void;
  loading: boolean;
  error: any;
  renderField: (field: any) => React.ReactNode;
  config: FormLayoutConfig;
  initialData?: Record<string, any>;
}

const FormLayout = ({
  handleSubmit,
  formData,
  handleFieldChange,
  loading,
  error,
  renderField,
  config,
  initialData
}: FormLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-0">
      {/* Top Bar */}
      <div className="h-10 flex items-center justify-between px-4 py-1 bg-secondary border-b border-border">
        <Button 
          variant="ghost" 
          onClick={() => navigate(config.backRoute)}
          className="flex items-center gap-2 text-black dark:text-black hover:scale-105 transition-transform px-4 py-1 h-8 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={loading} 
          className="bg-secondary-foreground text-secondary hover:bg-secondary-foreground/90 px-4 py-1 h-8 text-sm font-medium shadow-lg border border-secondary-foreground/20 hover:shadow-md transition-all duration-200"
          style={{
            boxShadow: '0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}
        >
          {loading ? "Loading..." : "Save"}
        </Button>
      </div>
      
      {/* Form Information Card */}
      <div className="bg-card rounded-md shadow-sm px-2 py-1 mt-4">
        <form onSubmit={handleSubmit} className="h-full">
          <div 
            className="flex items-center gap-4 mb-4 py-1 -mx-2 bg-accent/20 border border-accent/30 rounded-md" 
          >
            <h3 className="text-h3 font-medium text-primary dark:text-secondary ml-6">
              {config.title}
              {config.title.includes("Work Order") && formData?.code && (
                <span className="ml-4 text-muted-foreground">Code: {formData.code}</span>
              )}
            </h3>
            {!config.title.includes("Work Order") && (formData?.code || formData?.name) && (
              <span className="text-h3 font-medium text-muted-foreground ml-16">
                {formData?.code && `(${formData.code})`} {formData?.name}
              </span>
            )}
          </div>
          
          {/* Layout */}
          <div className="flex gap-8 items-center -mt-2 pb-1">
            {/* Left Section - Image, toggle, location */}
            {(config.showImage || config.showOnlineToggle || config.showSpecialSections?.location || config.showSpecialSections?.equipment) && (
              <div className="flex flex-col space-y-1 w-48 pl-4">
                {config.showOnlineToggle && (
                  <div className="flex items-center space-x-0">
                    <div 
                      className={`flex items-center cursor-pointer transition-all duration-300 rounded border w-36 h-6 ${
                        formData?.is_online 
                          ? 'bg-green-500 border-green-600' 
                          : 'bg-red-500 border-red-600'
                      }`}
                      onClick={() => handleFieldChange("is_online", !formData?.is_online)}
                     >
                       {/* Status text with icon */}
                       <div className="flex items-center justify-center gap-1 text-xs font-medium text-white w-full">
                         {formData?.is_online ? (
                           <>
                             <Check size={10} />
                             Online
                           </>
                         ) : (
                           <>
                             <X size={10} />
                             Offline
                           </>
                         )}
                       </div>
                     </div>
                  </div>
                )}
                {config.showImage && (
                  <div className="w-36 h-24 bg-muted rounded border-2 border-border overflow-hidden">
                    <img 
                      src="/lovable-uploads/cf9d21df-6820-4bea-ae16-54c41a67117e.png" 
                      alt={config.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {config.showSpecialSections?.location && (
                  <div className="space-y-1 w-36">
                    <label className="block text-xs font-normal text-foreground text-center">Location</label>
                    {config.title.includes("Work Order") ? (
                       <div className="w-full p-1.5 bg-muted rounded border text-xs text-foreground text-center">
                         {initialData?.["asset.location"] || "No location assigned"}
                       </div>
                    ) : (
                      renderField({ 
                        name: "location", 
                        type: "dropdown", 
                        required: true, 
                        endpoint: "/company/location", 
                        queryKey: ["company_location"], 
                        optionValueKey: "id", 
                        optionLabelKey: "name"
                      })
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Right Section - Form fields in columns */}
            <div className="flex-1 max-w-full">
            <div className={`grid gap-x-6 gap-y-3 ${
                config.columns.length === 1 
                  ? 'grid-cols-1' 
                  : config.columns.length === 2 && config.title.includes("Work Order")
                    ? 'grid-cols-[2fr_1fr]' 
                    : config.columns.length === 2 
                      ? 'grid-cols-2' 
                      : 'grid-cols-3'
              }`}>
                 {config.columns.map((column, colIndex) => (
                    <div key={colIndex} className="p-4 space-y-3 relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-2xl min-w-0">
                     {column.fields.map((field, fieldIndex) => {
                        // Special handling for model and year to be on the same row
                        if (field.name === "model" && column.fields[fieldIndex + 1]?.name === "year") {
                          const yearField = column.fields[fieldIndex + 1];
                          return (
                            <div key="model-year-row" className="space-y-1">
                              <div className="flex items-start gap-2 h-8">
                                 <label className="text-caption font-normal text-right w-16 text-foreground shrink-0 pt-2">{field.label}</label>
                                 <div className="flex items-center gap-2 flex-grow">
                                   <div className="flex-1">
                                     {renderField({ 
                                       ...field, 
                                       label: "",
                                       options: field.options ? field.options.map(opt => ({ value: opt.id, label: opt.name })) : undefined
                                     })}
                                   </div>
                                   <label className="text-caption font-normal text-foreground shrink-0 -mt-2">{yearField.label}</label>
                                   <div className="flex-1">
                                     {renderField({ 
                                       ...yearField, 
                                       label: "",
                                       options: yearField.options ? yearField.options.map(opt => ({ value: opt.id, label: opt.name })) : undefined
                                     })}
                                   </div>
                                 </div>
                              </div>
                            </div>
                          );
                        }
                        // Skip rendering year field separately since it's handled above
                        if (field.name === "year" && column.fields[fieldIndex - 1]?.name === "model") {
                          return null;
                         }
                        // Handle spacer field type
                        if (field.type === "spacer") {
                          return <div key={field.name} className="h-2"></div>;
                        }
                         // Default single field rendering
                         return (
                           <div key={field.name} className="flex items-start gap-2 h-8">
                              <label className={`text-caption font-normal text-right w-16 text-foreground shrink-0 ${field.name === 'weight_class' ? 'pt-0.5' : field.name === 'description' ? 'pt-2 pr-2' : 'pt-2'}`}>{field.label}</label>
                              <div className="flex-grow">
                                {renderField({ 
                                  ...field, 
                                  label: "",
                                  options: field.options ? field.options.map(opt => ({ value: opt.id, label: opt.name })) : undefined
                                })}
                              </div>
                           </div>
                         );
                     })}
                   </div>
                ))}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormLayout;
