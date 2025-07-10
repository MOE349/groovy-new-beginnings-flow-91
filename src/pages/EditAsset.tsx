import { useParams, useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import ApiForm from "@/components/ApiForm";
import ApiTable from "@/components/ApiTable";
import { apiPost, apiDelete } from "@/utils/apis";
import GearSpinner from "@/components/ui/gear-spinner";
import { AlertTriangle, ArrowLeft, Trash2, Check, X } from "lucide-react";
import { useAssetData } from "@/hooks/useAssetData";
import { useAssetSubmit } from "@/hooks/useAssetSubmit";
import { equipmentFields, attachmentFields } from "@/data/assetFormFields";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

const EditAsset = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { assetType, assetData, isLoading, isError, error } = useAssetData(id);
  const { handleSubmit } = useAssetSubmit(id, assetType);

  const handleDeleteMeterReading = async (readingId: string) => {
    try {
      await apiDelete(`/meter-readings/meter_reading/${readingId}`);
      queryClient.invalidateQueries({ queryKey: ["meter_readings", id] });
      toast({
        title: "Success",
        description: "Meter reading deleted successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete meter reading",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <GearSpinner fullscreen />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load asset data: {error?.message || "Unknown error"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!assetType || !assetData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <GearSpinner fullscreen />
      </div>
    );
  }

  const currentFields = assetType === "equipment" ? equipmentFields : attachmentFields;
  const assetTypeName = assetType === "equipment" ? "Equipment" : "Attachment";

  // Transform date strings to Date objects and object values to IDs for dropdowns
  const initialData = {
    ...assetData,
    purchase_date: assetData?.purchase_date ? new Date(assetData.purchase_date) : undefined,
    // Transform object values to their IDs for dropdown compatibility
    category: assetData?.category?.id || assetData?.category || "",
    location: assetData?.location?.id || assetData?.location || "",
    equipment: assetData?.equipment?.id || assetData?.equipment || "",
  };

  const customLayout = ({ handleSubmit, formData, handleFieldChange, loading, error, renderField }: any) => (
    <div className="space-y-0">
      {/* Top Bar - Reduced height by 20% */}
      <div className="h-8 flex items-center justify-between px-4 py-1 bg-secondary border-b border-border">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/assets")}
          className="flex items-center gap-2 px-4 py-1 h-8 text-sm"
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
      
      {/* Equipment Information Card */}
      <div className="bg-white rounded-md shadow-sm p-4 mt-4" style={{ padding: '16px' }}>
        <form onSubmit={handleSubmit} className="h-full">
          {/* Header - Reduced height by 20% */}
          <div 
            className="flex items-center gap-4 mb-4 py-1 -mx-2 bg-accent/20 border border-accent/30 rounded-md" 
            style={{ height: '36px' }}
          >
            <h3 className="text-h3 font-medium text-primary ml-6">{assetTypeName} Information</h3>
            {(formData?.code || formData?.name) && (
              <span className="text-h3 font-medium text-muted-foreground ml-16">
                {formData?.code && `(${formData.code})`} {formData?.name}
              </span>
            )}
          </div>
          
          {/* Main Layout - 8px baseline grid */}
          <div className="grid grid-cols-[auto_1fr] gap-8 items-start" style={{ gridTemplateRows: 'auto', gap: '32px' }}>
            
            {/* Left Section - Image and status */}
            <div className="flex flex-col space-y-4 w-64">
              <div className="flex items-center space-x-0">
                <div 
                  className={`flex items-center cursor-pointer transition-all duration-300 rounded border w-48 h-8 ${
                    formData?.is_online 
                      ? 'bg-green-500 border-green-600' 
                      : 'bg-red-500 border-red-600'
                  }`}
                  onClick={() => handleFieldChange("is_online", !formData?.is_online)}
                >
                  <div className="flex items-center justify-center w-8 h-full text-white">
                    {formData?.is_online ? (
                      <Check size={12} />
                    ) : (
                      <X size={12} />
                    )}
                  </div>
                  <div className="flex-1 text-sm font-medium text-white text-center">
                    {formData?.is_online ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
              
              <div className="w-48 h-32 bg-muted rounded border overflow-hidden">
                <img 
                  src="/lovable-uploads/cf9d21df-6820-4bea-ae16-54c41a67117e.png" 
                  alt="Equipment" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            {/* Right Section - Form fields with clean layout */}
            <div className="flex-1">
              
              {/* Basic Information Group */}
              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  
                  {/* Code */}
                  <div className="flex items-center" style={{ minHeight: '40px' }}>
                    <label 
                      className="block text-left text-foreground shrink-0"
                      style={{ 
                        width: '100px',
                        fontSize: '14px',
                        lineHeight: '20px',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        color: '#333'
                      }}
                    >
                      Code
                    </label>
                    <div style={{ width: '8px' }}></div>
                    <div className="flex-1">
                      <div style={{ 
                        border: '1px solid #CCC',
                        borderRadius: '4px',
                        padding: '6px',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                      }}
                      className="focus-within:border-yellow-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-yellow-400/20">
                        {renderField({ name: "code", type: "input", required: true, inputType: "text" })}
                      </div>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="flex items-center" style={{ minHeight: '40px' }}>
                    <label 
                      className="block text-left text-foreground shrink-0"
                      style={{ 
                        width: '100px',
                        fontSize: '14px',
                        lineHeight: '20px',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        color: '#333'
                      }}
                    >
                      Name
                    </label>
                    <div style={{ width: '8px' }}></div>
                    <div className="flex-1">
                      <div style={{ 
                        border: '1px solid #CCC',
                        borderRadius: '4px',
                        padding: '6px',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                      }}
                      className="focus-within:border-yellow-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-yellow-400/20">
                        {renderField({ name: "name", type: "input", required: true, inputType: "text" })}
                      </div>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="flex items-center" style={{ minHeight: '40px' }}>
                    <label 
                      className="block text-left text-foreground shrink-0"
                      style={{ 
                        width: '100px',
                        fontSize: '14px',
                        lineHeight: '20px',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        color: '#333'
                      }}
                    >
                      Category
                    </label>
                    <div style={{ width: '8px' }}></div>
                    <div className="flex-1">
                      <div style={{ 
                        border: '1px solid #CCC',
                        borderRadius: '4px',
                        padding: '6px',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                      }}
                      className="focus-within:border-yellow-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-yellow-400/20">
                        {renderField({ 
                          name: "category", 
                          type: "dropdown", 
                          required: true, 
                          endpoint: assetType === "equipment" ? "/assets/equipment_category" : "/assets/attachment_category",
                          queryKey: assetType === "equipment" ? ["equipment_category"] : ["attachment_category"],
                          optionValueKey: "id", 
                          optionLabelKey: "name"
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Make */}
                  <div className="flex items-center" style={{ minHeight: '40px' }}>
                    <label 
                      className="block text-left text-foreground shrink-0"
                      style={{ 
                        width: '100px',
                        fontSize: '14px',
                        lineHeight: '20px',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        color: '#333'
                      }}
                    >
                      Make
                    </label>
                    <div style={{ width: '8px' }}></div>
                    <div className="flex-1">
                      <div style={{ 
                        border: '1px solid #CCC',
                        borderRadius: '4px',
                        padding: '6px',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                      }}
                      className="focus-within:border-yellow-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-yellow-400/20">
                        {renderField({ name: "make", type: "input", required: true, inputType: "text" })}
                      </div>
                    </div>
                  </div>

                  {/* Model */}
                  <div className="flex items-center" style={{ minHeight: '40px' }}>
                    <label 
                      className="block text-left text-foreground shrink-0"
                      style={{ 
                        width: '100px',
                        fontSize: '14px',
                        lineHeight: '20px',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        color: '#333'
                      }}
                    >
                      Model
                    </label>
                    <div style={{ width: '8px' }}></div>
                    <div className="flex-1">
                      <div style={{ 
                        border: '1px solid #CCC',
                        borderRadius: '4px',
                        padding: '6px',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                      }}
                      className="focus-within:border-yellow-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-yellow-400/20">
                        {renderField({ name: "model", type: "input", required: true, inputType: "text" })}
                      </div>
                    </div>
                  </div>

                  {/* Serial # */}
                  <div className="flex items-center" style={{ minHeight: '40px' }}>
                    <label 
                      className="block text-left text-foreground shrink-0"
                      style={{ 
                        width: '100px',
                        fontSize: '14px',
                        lineHeight: '20px',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        color: '#333'
                      }}
                    >
                      Serial #
                    </label>
                    <div style={{ width: '8px' }}></div>
                    <div className="flex-1">
                      <div style={{ 
                        border: '1px solid #CCC',
                        borderRadius: '4px',
                        padding: '6px',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                      }}
                      className="focus-within:border-yellow-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-yellow-400/20">
                        {renderField({ name: "serial_number", type: "input", required: true, inputType: "text" })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status and Codes Group */}
              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  
                  {/* Asset Status */}
                  <div className="flex items-center" style={{ minHeight: '40px' }}>
                    <label 
                      className="block text-left text-foreground shrink-0"
                      style={{ 
                        width: '100px',
                        fontSize: '14px',
                        lineHeight: '20px',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        color: '#333'
                      }}
                    >
                      Asset Status
                    </label>
                    <div style={{ width: '8px' }}></div>
                    <div className="flex-1">
                      <div style={{ 
                        border: '1px solid #CCC',
                        borderRadius: '4px',
                        padding: '6px',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                      }}
                      className="focus-within:border-yellow-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-yellow-400/20">
                        {renderField({ 
                          name: "status", 
                          type: "dropdown",
                          required: true,
                          options: [
                            { id: "active", name: "Active" },
                            { id: "inactive", name: "Inactive" },
                            { id: "maintenance", name: "Under Maintenance" },
                            { id: "retired", name: "Retired" }
                          ]
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Job Code */}
                  <div className="flex items-center" style={{ minHeight: '40px' }}>
                    <label 
                      className="block text-left text-foreground shrink-0"
                      style={{ 
                        width: '100px',
                        fontSize: '14px',
                        lineHeight: '20px',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        color: '#333'
                      }}
                    >
                      Job Code
                    </label>
                    <div style={{ width: '8px' }}></div>
                    <div className="flex-1">
                      <div style={{ 
                        border: '1px solid #CCC',
                        borderRadius: '4px',
                        padding: '6px',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                      }}
                      className="focus-within:border-yellow-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-yellow-400/20">
                        {renderField({ 
                          name: "job_code", 
                          type: "dropdown",
                          options: [
                            { id: "job001", name: "JOB-001" },
                            { id: "job002", name: "JOB-002" },
                            { id: "job003", name: "JOB-003" },
                            { id: "job004", name: "JOB-004" }
                          ]
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Account Code */}
                  <div className="flex items-center" style={{ minHeight: '40px' }}>
                    <label 
                      className="block text-left text-foreground shrink-0"
                      style={{ 
                        width: '100px',
                        fontSize: '14px',
                        lineHeight: '20px',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        color: '#333'
                      }}
                    >
                      Account Code
                    </label>
                    <div style={{ width: '8px' }}></div>
                    <div className="flex-1">
                      <div style={{ 
                        border: '1px solid #CCC',
                        borderRadius: '4px',
                        padding: '6px',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                      }}
                      className="focus-within:border-yellow-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-yellow-400/20">
                        {renderField({ 
                          name: "account_code", 
                          type: "dropdown",
                          options: [
                            { id: "acc001", name: "ACC-001" },
                            { id: "acc002", name: "ACC-002" },
                            { id: "acc003", name: "ACC-003" },
                            { id: "acc004", name: "ACC-004" }
                          ]
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Project */}
                  <div className="flex items-center" style={{ minHeight: '40px' }}>
                    <label 
                      className="block text-left text-foreground shrink-0"
                      style={{ 
                        width: '100px',
                        fontSize: '14px',
                        lineHeight: '20px',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        color: '#333'
                      }}
                    >
                      Project
                    </label>
                    <div style={{ width: '8px' }}></div>
                    <div className="flex-1">
                      <div style={{ 
                        border: '1px solid #CCC',
                        borderRadius: '4px',
                        padding: '6px',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                      }}
                      className="focus-within:border-yellow-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-yellow-400/20">
                        {renderField({ 
                          name: "project", 
                          type: "dropdown",
                          options: [
                            { id: "proj001", name: "Project Alpha" },
                            { id: "proj002", name: "Project Beta" },
                            { id: "proj003", name: "Project Gamma" },
                            { id: "proj004", name: "Project Delta" }
                          ]
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center" style={{ minHeight: '40px' }}>
                    <label 
                      className="block text-left text-foreground shrink-0"
                      style={{ 
                        width: '100px',
                        fontSize: '14px',
                        lineHeight: '20px',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        color: '#333'
                      }}
                    >
                      Location
                    </label>
                    <div style={{ width: '8px' }}></div>
                    <div className="flex-1">
                      <div style={{ 
                        border: '1px solid #CCC',
                        borderRadius: '4px',
                        padding: '6px',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                      }}
                      className="focus-within:border-yellow-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-yellow-400/20">
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
                    </div>
                  </div>

                  {assetType === "attachment" && (
                    /* Equipment */
                    <div className="flex items-center" style={{ minHeight: '40px' }}>
                      <label 
                        className="block text-left text-foreground shrink-0"
                        style={{ 
                          width: '100px',
                          fontSize: '14px',
                          lineHeight: '20px',
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                          color: '#333'
                        }}
                      >
                        Equipment
                      </label>
                      <div style={{ width: '8px' }}></div>
                      <div className="flex-1">
                        <div style={{ 
                          border: '1px solid #CCC',
                          borderRadius: '4px',
                          padding: '6px',
                          transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                        }}
                        className="focus-within:border-yellow-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-yellow-400/20">
                          {renderField({ 
                            name: "equipment", 
                            type: "dropdown", 
                            endpoint: "/assets/equipments", 
                            queryKey: ["assets_equipments"], 
                            optionValueKey: "id", 
                            optionLabelKey: "name"
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description - Full width */}
              <div className="space-y-4">
                <div className="flex items-start" style={{ minHeight: '64px' }}>
                  <label 
                    className="block text-left text-foreground shrink-0 pt-1"
                    style={{ 
                      width: '100px',
                      fontSize: '14px',
                      lineHeight: '20px',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      color: '#333'
                    }}
                  >
                    Description
                  </label>
                  <div style={{ width: '8px' }}></div>
                  <div className="flex-1">
                    <div style={{ 
                      border: '1px solid #CCC',
                      borderRadius: '4px',
                      padding: '6px',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                    }}
                    className="focus-within:border-yellow-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-yellow-400/20">
                      {renderField({ name: "description", type: "textarea", rows: 3 })}
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

  return (
    <div className="space-y-6">
      <div>
        <ApiForm
          fields={currentFields}
          onSubmit={handleSubmit}
          initialData={initialData}
          customLayout={customLayout}
        />
      </div>

      {/* Compact Tabs Section */}
      <div>
        <Tabs defaultValue="parts-bom" className="h-full">
          {/* Compact Pill-Style Tab List */}
          <div className="h-14 overflow-x-auto">
            <TabsList className="grid w-full grid-cols-7 h-14 bg-card border border-border rounded-md p-0">
              <TabsTrigger 
                value="parts-bom" 
                className="px-4 py-1 text-base font-normal data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Parts/BOM
              </TabsTrigger>
              <TabsTrigger 
                value="metering-events"
                className="px-4 py-1 text-base font-normal data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Metering/Events
              </TabsTrigger>
              <TabsTrigger 
                value="scheduled-maintenance"
                className="px-4 py-1 text-base font-normal data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Scheduled Maintenance
              </TabsTrigger>
              <TabsTrigger 
                value="financials"
                className="px-4 py-1 text-base font-normal data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Financials
              </TabsTrigger>
              <TabsTrigger 
                value="files"
                className="px-4 py-1 text-base font-normal data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Files
              </TabsTrigger>
              <TabsTrigger 
                value="backlog"
                className="px-4 py-1 text-base font-normal data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Backlog
              </TabsTrigger>
              <TabsTrigger 
                value="log"
                className="px-4 py-1 text-base font-normal data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Log
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Tab Content Panels - Compact */}
          <TabsContent value="parts-bom" className="mt-4">
            <div className="bg-card rounded-sm shadow-xs p-4 space-y-4">
              <h3 className="text-h3 font-medium text-foreground">Parts/BOM</h3>
              <p className="text-caption text-muted-foreground">Parts and Bill of Materials content will go here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="metering-events" className="mt-4">
            <div className="bg-card rounded-sm shadow-xs p-4 space-y-4">
              <h3 className="text-h3 font-medium text-foreground">Metering/Events</h3>
              
              {/* Add Meter Reading Form - Compact */}
              <div className="flex items-end gap-4">
                <div className="w-80">
                  <label className="block text-caption font-normal mb-1 text-foreground">
                    Meter Reading <span className="text-destructive">*</span>
                  </label>
                  <ApiForm
                    fields={[
                      {
                        name: "meter_reading",
                        type: "input",
                        inputType: "text",
                        required: true
                      }
                    ]}
                    onSubmit={async (data) => {
                      const submissionData = {
                        ...data,
                        asset: id
                      };
                      try {
                        await apiPost("/meter-readings/meter_reading", submissionData);
                        queryClient.invalidateQueries({ queryKey: ["meter_readings", id] });
                        toast({
                          title: "Success",
                          description: "Meter reading added successfully!",
                        });
                      } catch (error: any) {
                        toast({
                          title: "Error",
                          description: error.message || "Failed to add meter reading",
                          variant: "destructive",
                        });
                      }
                    }}
                    customLayout={({ handleSubmit, renderField }) => (
                      <div className="flex items-center gap-3">
                        <div className="w-48">
                          {renderField({ 
                            name: "meter_reading", 
                            type: "input", 
                            inputType: "text", 
                            required: true
                          })}
                        </div>
                        <Button onClick={handleSubmit} className="h-10 px-6 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                          Save
                        </Button>
                      </div>
                    )}
                  />
                </div>
              </div>

              {/* Meter Readings Table */}
              <div className="space-y-2 w-3/8">
                <ApiTable
                  endpoint={`/meter-readings/meter_reading?asset=${id}`}
                  queryKey={["meter_readings", id]}
                  columns={[
                    { key: 'meter_reading', header: 'Meter Reading', type: 'string', className: "py-1 px-2" },
                    { key: 'created_at', header: 'Creation Date', type: 'date', className: "py-1 px-2" },
                    { key: 'created_by', header: 'Created By', type: 'object', className: "py-1 px-2" },
                    { 
                      key: 'actions', 
                      header: '', 
                      render: (value: any, row: any) => (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMeterReading(row.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      ),
                      className: "w-10 py-1 px-2"
                    },
                  ]}
                  emptyMessage="No meter readings found"
                  tableClassName="text-xs [&_td]:py-1 [&_td]:px-2 [&_th]:py-1 [&_th]:px-2 [&_th]:h-8"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="scheduled-maintenance" className="mt-4">
            <div className="bg-card rounded-sm shadow-xs p-4 space-y-4">
              <h3 className="text-h3 font-medium text-foreground">Scheduled Maintenance</h3>
              <p className="text-caption text-muted-foreground">Scheduled maintenance content will go here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="financials" className="mt-4">
            <div className="bg-card rounded-sm shadow-xs p-4 space-y-4">
              <h3 className="text-h3 font-medium text-foreground">Financials</h3>
              <p className="text-caption text-muted-foreground">Financial information content will go here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="files" className="mt-4">
            <div className="bg-card rounded-sm shadow-xs p-4 space-y-4">
              <h3 className="text-h3 font-medium text-foreground">Files</h3>
              <p className="text-caption text-muted-foreground">File attachments and documents will go here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="backlog" className="mt-4">
            <div className="bg-card rounded-sm shadow-xs p-4 space-y-4">
              <h3 className="text-h3 font-medium text-foreground">Backlog</h3>
              <p className="text-caption text-muted-foreground">Backlog items and tasks will go here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="log" className="mt-4">
            <div className="bg-card rounded-sm shadow-xs p-4 space-y-4">
              <h3 className="text-h3 font-medium text-foreground">Log</h3>
              <p className="text-caption text-muted-foreground">Activity log content will go here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EditAsset;