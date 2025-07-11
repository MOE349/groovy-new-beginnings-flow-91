import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { apiPost, apiPut, apiGet } from "@/utils/apis";
import ApiForm from "@/components/ApiForm";
import { entityConfigs } from "@/config/entityConfigs";
import { EntityConfig } from "@/types/entityConfig";

interface EntityFormProps {
  entityType: string;
}

const EntityForm: React.FC<EntityFormProps> = ({ entityType }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = location.pathname.includes("/edit/");
  
  const config = entityConfigs[entityType];
  const [selectedType, setSelectedType] = useState<string>("");
  const [initialData, setInitialData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  // For assets, determine the actual type from the route or data
  useEffect(() => {
    if (entityType === "assets" && isEditMode && id) {
      // Fetch asset data to determine type
      const fetchAssetData = async () => {
        try {
          setLoading(true);
          // Try equipment first
          try {
            const equipmentData = await apiGet(`/assets/equipments/${id}`);
            setSelectedType("equipment");
            setInitialData(equipmentData);
            return;
          } catch {
            // If equipment fails, try attachment
            const attachmentData = await apiGet(`/assets/attachments/${id}`);
            setSelectedType("attachment");
            setInitialData(attachmentData);
          }
        } catch (error: any) {
          toast({
            title: "Error",
            description: "Failed to load asset data",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };
      
      fetchAssetData();
    } else if (entityType === "work-orders" && isEditMode && id) {
      // Fetch work order data
      const fetchWorkOrderData = async () => {
        try {
          setLoading(true);
          const data = await apiGet(`/work-orders/work_order/${id}`);
          setInitialData(data);
        } catch (error: any) {
          toast({
            title: "Error", 
            description: "Failed to load work order data",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };
      
      fetchWorkOrderData();
    }
  }, [entityType, isEditMode, id]);

  if (!config) {
    return <div>Entity configuration not found</div>;
  }

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      setLoading(true);
      
      if (isEditMode && id) {
        // Edit mode
        let endpoint = config.updateEndpoint(id);
        if (entityType === "assets") {
          endpoint = selectedType === "equipment" 
            ? `/assets/equipments/${id}`
            : `/assets/attachments/${id}`;
        }
        
        await apiPut(endpoint, data);
        toast({
          title: "Success",
          description: `${config.name} updated successfully!`,
        });
      } else {
        // Create mode
        let endpoint = config.createEndpoint;
        if (entityType === "assets" && config.typeSelection) {
          const typeConfig = config.typeSelection.types.find(t => t.key === selectedType);
          endpoint = typeConfig?.endpoint || config.createEndpoint;
        }
        
        await apiPost(endpoint, data);
        toast({
          title: "Success", 
          description: `${config.name} created successfully!`,
        });
      }
      
      navigate(config.listRoute);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditMode ? 'update' : 'create'} ${config.name.toLowerCase()}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Type selection for assets
  if (entityType === "assets" && config.typeSelection?.enabled && !selectedType) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Create New Asset</h1>
          <p className="text-muted-foreground">Choose the type of asset you want to create</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
          {config.typeSelection.types.map((type) => (
            <Card key={type.key} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <Button
                  onClick={() => setSelectedType(type.key)}
                  variant="outline" 
                  className="w-full h-24 text-lg"
                >
                  {type.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Get current fields based on type
  let currentFields = config.fields;
  if (entityType === "assets" && config.typeSelection && selectedType) {
    const typeConfig = config.typeSelection.types.find(t => t.key === selectedType);
    currentFields = typeConfig?.fields || config.fields;
  }

  const title = isEditMode ? `Edit ${config.name}` : `Create ${config.name}`;

  return (
    <div className="space-y-6">
      <ApiForm
        fields={currentFields}
        title={title}
        onSubmit={handleSubmit}
        submitText={isEditMode ? "Update" : "Create"}
        loading={loading}
        initialData={initialData}
        customLayout={config.customLayout ? (props) => 
          config.customLayout!({
            ...props,
            isEditMode,
            entityType: selectedType || entityType
          }) : undefined
        }
      />
      
      {config.tabs && config.tabs.length > 0 && (
        <Tabs defaultValue={config.tabs[0].key} className="space-y-4">
          <TabsList className="grid grid-cols-7 gap-4">
            {config.tabs.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {config.tabs.map((tab) => (
            <TabsContent key={tab.key} value={tab.key}>
              <Card>
                <CardContent className="p-6">
                  {tab.content || (
                    <div className="text-center text-muted-foreground">
                      {tab.label} content will be displayed here.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default EntityForm;