import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X } from "lucide-react";

interface AssetFormLayoutProps {
  handleSubmit: () => void;
  formData: Record<string, any>;
  handleFieldChange: (field: string, value: any) => void;
  loading: boolean;
  error: any;
  renderField: (field: any) => React.ReactNode;
  assetType?: "equipment" | "attachment";
  assetTypeName?: string;
}

const AssetFormLayout = ({
  handleSubmit,
  formData,
  handleFieldChange,
  loading,
  error,
  renderField,
  assetType = "equipment",
  assetTypeName = "Equipment"
}: AssetFormLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-0">
      {/* Top Bar */}
      <div className="h-10 flex items-center justify-between px-4 py-1 bg-secondary border-b border-border">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/assets")}
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
      
      {/* Asset Information Card */}
      <div className="bg-card rounded-md shadow-sm px-2 py-1 mt-4">
        <form onSubmit={handleSubmit} className="h-full">
          <div 
            className="flex items-center gap-4 mb-4 py-1 -mx-2 bg-accent/20 border border-accent/30 rounded-md" 
          >
            <h3 className="text-h3 font-medium text-primary dark:text-secondary ml-6">{assetTypeName} Information</h3>
            {(formData?.code || formData?.name) && (
              <span className="text-h3 font-medium text-muted-foreground ml-16">
                {formData?.code && `(${formData.code})`} {formData?.name}
              </span>
            )}
          </div>
          
          {/* Layout matching reference design */}
          <div className="flex gap-8 items-center -mt-2 pb-1">
            {/* Left Section - Image, toggle, location */}
            <div className="flex flex-col space-y-1 w-64 pl-6">
              <div className="flex items-center space-x-0">
                <div 
                  className={`flex items-center cursor-pointer transition-all duration-300 rounded border w-48 h-8 ${
                    formData?.is_online 
                      ? 'bg-green-500 border-green-600' 
                      : 'bg-red-500 border-red-600'
                  }`}
                  onClick={() => handleFieldChange("is_online", !formData?.is_online)}
                 >
                   {/* Status text with icon */}
                   <div className="flex items-center justify-center gap-1 text-sm font-medium text-white w-full">
                     {formData?.is_online ? (
                       <>
                         <Check size={12} />
                         Online
                       </>
                     ) : (
                       <>
                         <X size={12} />
                         Offline
                       </>
                     )}
                   </div>
                 </div>
              </div>
              <div className="w-48 h-32 bg-muted rounded border-2 border-border overflow-hidden">
                <img 
                  src="/lovable-uploads/cf9d21df-6820-4bea-ae16-54c41a67117e.png" 
                  alt={assetTypeName} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1 w-48">
                <label className="block text-caption font-normal text-foreground text-center">Location</label>
                {renderField({ 
                  name: "location", 
                  type: "dropdown", 
                  required: true, 
                  endpoint: "/company/location", 
                  queryKey: ["company_location"], 
                  optionValueKey: "id", 
                  optionLabelKey: "name"
                })}
              </div>
              {assetType === "attachment" && (
                <div className="space-y-1 w-48">
                  <label className="block text-caption font-normal text-foreground text-center">Equipment</label>
                  {renderField({ 
                    name: "equipment", 
                    type: "dropdown", 
                    endpoint: "/assets/equipments", 
                    queryKey: ["assets_equipments"], 
                    optionValueKey: "id", 
                    optionLabelKey: "name"
                  })}
                </div>
              )}
            </div>
            
            {/* Right Section - Form fields in three columns */}
            <div className="flex-1">
              <div className="grid grid-cols-3 gap-x-8 gap-y-2">
                {/* First sub-column */}
                <div className="p-6 space-y-2 relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl">
                  <div className="flex items-start gap-2 h-10">
                    <label className="text-caption font-normal text-right w-20 text-foreground shrink-0 pt-2.5">Code</label>
                    <div className="flex-grow">
                      {renderField({ name: "code", type: "input", required: true, inputType: "text", label: "" })}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 h-10">
                    <label className="text-caption font-normal text-right w-20 text-foreground shrink-0 pt-2.5">Name</label>
                    <div className="flex-grow">
                      {renderField({ name: "name", type: "input", required: true, inputType: "text", label: "" })}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 h-16">
                    <label className="text-caption font-normal text-right w-20 text-foreground shrink-0 pt-2.5">Description</label>
                    <div className="flex-grow">
                      {renderField({ name: "description", type: "textarea", rows: 2, label: "" })}
                    </div>
                  </div>
                </div>
               
                {/* Second sub-column */}
                <div className="p-6 space-y-2 relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl">
                  <div className="flex items-start gap-2 h-10">
                    <label className="text-caption font-normal text-right w-20 text-foreground shrink-0 pt-2.5">Category</label>
                    <div className="flex-grow">
                      {renderField({ 
                        name: "category", 
                        type: "dropdown", 
                        required: true, 
                        endpoint: assetType === "equipment" ? "/assets/equipment_category" : "/assets/attachment_category",
                        queryKey: assetType === "equipment" ? ["equipment_category"] : ["attachment_category"],
                        optionValueKey: "id", 
                        optionLabelKey: "name",
                        label: ""
                      })}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 h-10">
                    <label className="text-caption font-normal text-right w-20 text-foreground shrink-0 pt-2.5">Make</label>
                    <div className="flex-grow">
                      {renderField({ name: "make", type: "input", required: true, inputType: "text", label: "" })}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 h-10">
                    <label className="text-caption font-normal text-right w-20 text-foreground shrink-0 pt-2.5">Model</label>
                    <div className="flex-grow">
                      {renderField({ name: "model", type: "input", required: true, inputType: "text", label: "" })}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 h-10">
                    <label className="text-caption font-normal text-right w-20 text-foreground shrink-0 pt-2.5">Serial #</label>
                    <div className="flex-grow">
                      {renderField({ name: "serial_number", type: "input", required: true, inputType: "text", label: "" })}
                    </div>
                  </div>
                </div>
               
                {/* Third sub-column */}
                <div className="p-6 space-y-2 relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl">
                   <div className="flex items-start gap-2 h-10">
                     <label className="text-caption font-normal text-right w-20 text-foreground shrink-0 pt-0">Asset Status</label>
                    <div className="flex-grow">
                      {renderField({ 
                        name: "status", 
                        type: "dropdown",
                        required: true,
                        options: [
                          { id: "active", name: "Active" },
                          { id: "inactive", name: "Inactive" },
                          { id: "maintenance", name: "Under Maintenance" },
                          { id: "retired", name: "Retired" }
                        ],
                        label: ""
                      })}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 h-10">
                    <label className="text-caption font-normal text-right w-20 text-foreground shrink-0 pt-2.5">Job Code</label>
                    <div className="flex-grow">
                      {renderField({ 
                        name: "job_code", 
                        type: "dropdown",
                        options: [
                          { id: "job001", name: "JOB-001" },
                          { id: "job002", name: "JOB-002" },
                          { id: "job003", name: "JOB-003" },
                          { id: "job004", name: "JOB-004" }
                        ],
                        label: ""
                      })}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 h-10">
                    <label className="text-caption font-normal text-right w-20 text-foreground shrink-0 pt-0">Account Code</label>
                    <div className="flex-grow">
                      {renderField({ 
                        name: "account_code", 
                        type: "dropdown",
                        options: [
                          { id: "acc001", name: "ACC-001" },
                          { id: "acc002", name: "ACC-002" },
                          { id: "acc003", name: "ACC-003" },
                          { id: "acc004", name: "ACC-004" }
                        ],
                        label: ""
                      })}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 h-10">
                    <label className="text-caption font-normal text-right w-20 text-foreground shrink-0 pt-2.5">Project</label>
                    <div className="flex-grow">
                      {renderField({ 
                        name: "project", 
                        type: "dropdown",
                        options: [
                          { id: "proj001", name: "Project Alpha" },
                          { id: "proj002", name: "Project Beta" },
                          { id: "proj003", name: "Project Gamma" },
                          { id: "proj004", name: "Project Delta" }
                        ],
                        label: ""
                      })}
                    </div>
                  </div>
                </div>
             </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetFormLayout;