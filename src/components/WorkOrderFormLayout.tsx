import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X } from "lucide-react";
import { workOrderFields } from "@/data/workOrderFormFields";

interface WorkOrderFormLayoutProps {
  fields: any[];
  formData: Record<string, any>;
  handleFieldChange: (name: string, value: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error?: string;
  renderField: (field: any) => React.ReactNode;
}

const WorkOrderFormLayout = ({
  fields,
  formData,
  handleFieldChange,
  handleSubmit,
  loading,
  error,
  renderField
}: WorkOrderFormLayoutProps) => {
  const navigate = useNavigate();

  // Create a lookup for field definitions
  const getFieldConfig = (fieldName: string) => {
    return workOrderFields.find(field => field.name === fieldName);
  };

  return (
    <div className="space-y-0">
      {/* Top Bar */}
      <div className="h-10 flex items-center justify-between px-4 py-1 bg-secondary border-b border-border">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/workorders")}
          className="flex items-center gap-2 text-black dark:text-black px-4 py-1 h-8 text-sm"
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
      
      {/* Work Order Information Box */}
      <div className="bg-card rounded-md shadow-sm px-2 py-1 mt-4">
        <form onSubmit={handleSubmit} className="h-full">
          <div 
            className="flex items-center gap-4 mb-4 py-1 -mx-2 bg-accent/20 border border-accent/30 rounded-md"
          >
            <h3 className="text-h3 font-medium text-primary dark:text-secondary ml-6">Work Order Information</h3>
            <div className="ml-6 text-sm text-muted-foreground">
              Code: {formData?.code || "Loading..."}
            </div>
          </div>
          
          {/* Layout matching equipment design */}
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
                  alt="Work Order" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1 w-48">
                <label className="block text-caption font-normal text-foreground text-center">Location</label>
                {renderField(getFieldConfig("location"))}
              </div>
            </div>
            
            {/* Right Section - Form fields in two columns */}
            <div className="flex-1">
              <div className="flex gap-6 w-full">
                {/* First sub-column - Asset, Status, Description */}
                <div className="w-3/5 p-6 space-y-2 relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl">
                  <div className="flex items-start gap-2 h-10">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0 pt-2">Asset</label>
                    <div className="flex-grow">
                      {renderField(getFieldConfig("asset"))}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 h-10">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0 pt-2">Status</label>
                    <div className="flex-grow">
                      {renderField(getFieldConfig("status"))}
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <label className="block text-caption font-normal text-right w-20 text-foreground shrink-0 pt-1">Description</label>
                    <div className="flex-grow">
                      {renderField(getFieldConfig("description"))}
                    </div>
                  </div>
                </div>
                
                {/* Second sub-column - Maint Type, Priority, Dates */}
                <div className="w-2/5 p-6 space-y-2 relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl">
                  <div className="flex items-start gap-2 h-10">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0 pt-2.5">Maint Type</label>
                    <div className="flex-grow">
                      {renderField(getFieldConfig("maint_type"))}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 h-10">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0 pt-2.5">Priority</label>
                    <div className="flex-grow">
                      {renderField(getFieldConfig("priority"))}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 h-10">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0 pt-2.5">Start Date</label>
                    <div className="flex-grow">
                      {renderField(getFieldConfig("suggested_start_date"))}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 h-10">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0 pt-2.5">Completion</label>
                    <div className="flex-grow">
                      {renderField(getFieldConfig("completion_end_date"))}
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

export default WorkOrderFormLayout;