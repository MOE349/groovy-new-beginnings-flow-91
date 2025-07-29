import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiCall } from '@/utils/apis';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus } from 'lucide-react';
import ApiForm from './ApiForm';
import ApiTable from './ApiTable';
import { useToast } from './ui/use-toast';
import { handleApiError } from '@/utils/errorHandling';

interface ChecklistItem {
  id: string;
  // Add other checklist item properties as needed
}

interface Iteration {
  id: string;
  interval_value: number;
  name: string;
  order: number;
  pm_settings: string;
  checklist_items: ChecklistItem[];
}

interface PMSetting {
  id: string;
  name: string;
  iterations: Iteration[];
  interval_value: number;
  interval_unit: string;
  is_active: boolean;
  object_id: string;
}

interface PMSettingsSelectorProps {
  assetId: string;
}

const PMSettingsSelector: React.FC<PMSettingsSelectorProps> = ({ assetId }) => {
  const [selectedPMSettingId, setSelectedPMSettingId] = useState<string>('');
  const [activeIterationId, setActiveIterationId] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isChecklistDialogOpen, setIsChecklistDialogOpen] = useState(false);
  const [isEditChecklistDialogOpen, setIsEditChecklistDialogOpen] = useState(false);
  const [editingChecklistItem, setEditingChecklistItem] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch PM settings for the asset
  const { data: pmSettingsData, isLoading } = useQuery({
    queryKey: ['/pm-automation/pm-settings', { object_id: assetId }],
    queryFn: async () => {
      const response = await apiCall('/pm-automation/pm-settings', {
        method: 'GET'
      });
      return response.data?.data || [];
    },
    enabled: !!assetId
  });

  const pmSettings: PMSetting[] = pmSettingsData ? 
    pmSettingsData.filter((setting: PMSetting) => setting.object_id === assetId) : [];
  const selectedPMSetting = pmSettings.find(setting => setting.id === selectedPMSettingId);
  const iterations = selectedPMSetting?.iterations || [];

  // Auto-select first PM setting if there's only one
  React.useEffect(() => {
    if (pmSettings.length === 1 && !selectedPMSettingId) {
      setSelectedPMSettingId(pmSettings[0].id);
    }
  }, [pmSettings, selectedPMSettingId]);

  // Set default active iteration when PM setting changes
  React.useEffect(() => {
    if (iterations.length > 0 && !activeIterationId) {
      setActiveIterationId(iterations[0].id);
    }
  }, [iterations, activeIterationId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading PM settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4 py-1">
        {/* Iterations label on the left */}
        {selectedPMSetting ? (
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Iterations</h3>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Iteration</DialogTitle>
                </DialogHeader>
                <ApiForm
                  fields={[
                    {
                      name: 'pm_settings',
                      label: 'PM Settings',
                      type: 'input',
                      inputType: 'hidden'
                    },
                    {
                      name: 'interval_value',
                      label: `Interval Value (${selectedPMSetting.interval_unit})`,
                      type: 'input',
                      inputType: 'number',
                      required: true
                    },
                    {
                      name: 'name',
                      label: 'Name',
                      type: 'input',
                      inputType: 'hidden'
                    }
                  ]}
                  initialData={{
                    pm_settings: selectedPMSettingId,
                    name: ''
                  }}
                  title=""
                  onSubmit={async (data) => {
                    try {
                      const intervalValue = parseFloat(data.interval_value);
                      const name = `${intervalValue} ${selectedPMSetting.interval_unit}`;
                      
                      await apiCall('/pm-automation/pm-iterations', {
                        method: 'POST',
                        body: {
                          pm_settings: selectedPMSettingId,
                          interval_value: intervalValue,
                          name: name
                        }
                      });
                      
                      toast({
                        title: "Success",
                        description: "Iteration created successfully"
                      });
                      
                      // Refresh the data
                      queryClient.invalidateQueries({
                        queryKey: ['/pm-automation/pm-settings']
                      });
                      
                      setIsDialogOpen(false);
                    } catch (error) {
                      handleApiError(error, "Creation Failed");
                    }
                  }}
                  submitText="Create Iteration"
                />
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div></div>
        )}

        {/* Select PM Settings moved slightly left */}
        <div className="flex items-center justify-center gap-4 mr-8">
          <label className="text-sm font-medium">Select PM Settings</label>
          <Select value={selectedPMSettingId} onValueChange={setSelectedPMSettingId}>
            <SelectTrigger className="w-fit min-w-48">
              <SelectValue placeholder="Choose a PM setting..." />
            </SelectTrigger>
            <SelectContent>
              {pmSettings.map((setting) => (
                <SelectItem key={setting.id} value={setting.id}>
                  <div className="flex items-center gap-2">
                    <span>{setting.name}</span>
                    <Badge variant={setting.is_active ? "default" : "secondary"} className="text-xs">
                      {setting.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Empty space on right for balance */}
        <div></div>
      </div>


      {/* Iterations Tabs - moved up */}
      {selectedPMSetting && (
        <div>
          {iterations.length > 0 && (
            <Tabs value={activeIterationId} onValueChange={setActiveIterationId}>
              <TabsList className="w-fit flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
                {iterations
                  .sort((a, b) => a.order - b.order)
                  .map((iteration, index) => (
                     <TabsTrigger 
                       key={iteration.id} 
                       value={iteration.id} 
                       className="group relative px-4 py-1 rounded-md bg-transparent text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 hover:bg-background hover:text-foreground font-medium text-sm min-w-[80px]"
                     >
                      {iteration.name}
                      {index > 0 && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await apiCall(`/pm-automation/pm-iterations/${iteration.id}`, {
                                method: 'DELETE'
                              });
                              toast({
                                title: "Success",
                                description: "Iteration deleted successfully"
                              });
                              queryClient.invalidateQueries({
                                queryKey: ['/pm-automation/pm-settings']
                              });
                            } catch (error) {
                              handleApiError(error, "Delete Failed");
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-destructive/80 transition-opacity"
                        >
                          ×
                        </button>
                      )}
                    </TabsTrigger>
                  ))}
              </TabsList>
              
              {iterations.map((iteration) => (
                <TabsContent key={iteration.id} value={iteration.id}>
                  <ApiTable
                    endpoint="/pm-automation/pm-iteration-checklist"
                    columns={[
                      { key: 'name', header: 'Name' }
                    ]}
                    filters={{ iteration: iteration.id }}
                    title="Checklist Items"
                    onCreateNew={() => setIsChecklistDialogOpen(true)}
                    createNewText="Add Checklist Item"
                    onRowClick={(row) => {
                      setEditingChecklistItem(row);
                      setIsEditChecklistDialogOpen(true);
                    }}
                  />
                </TabsContent>
              ))}
            </Tabs>
          )}
          
          {iterations.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  No iterations found for this PM setting. Click the + button to add one.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

       {/* Checklist Item Creation Dialog */}
       <Dialog open={isChecklistDialogOpen} onOpenChange={setIsChecklistDialogOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Add Checklist Item</DialogTitle>
           </DialogHeader>
           <ApiForm
             fields={[
               {
                 name: 'iteration',
                 label: 'Iteration',
                 type: 'input',
                 inputType: 'hidden'
               },
               {
                 name: 'name',
                 label: 'Checklist Item Name',
                 type: 'input',
                 inputType: 'text',
                 required: true
               }
             ]}
             initialData={{
               iteration: activeIterationId,
               name: ''
             }}
             title=""
             onSubmit={async (data) => {
               try {
                 await apiCall('/pm-automation/pm-iteration-checklist', {
                   method: 'POST',
                   body: {
                     iteration: activeIterationId,
                     name: data.name
                   }
                 });
                 
                 toast({
                   title: "Success",
                   description: "Checklist item created successfully"
                 });
                 
                 // Refresh the data
                 queryClient.invalidateQueries({
                   queryKey: ['/pm-automation/pm-iteration-checklist']
                 });
                 
                 setIsChecklistDialogOpen(false);
                } catch (error) {
                  handleApiError(error, "Creation Failed");
                }
             }}
             submitText="Create Checklist Item"
           />
          </DialogContent>
        </Dialog>

        {/* Checklist Item Edit Dialog */}
        <Dialog open={isEditChecklistDialogOpen} onOpenChange={setIsEditChecklistDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Checklist Item</DialogTitle>
            </DialogHeader>
            <ApiForm
              fields={[
                {
                  name: 'iteration',
                  label: 'Iteration',
                  type: 'input',
                  inputType: 'hidden'
                },
                {
                  name: 'name',
                  label: 'Checklist Item Name',
                  type: 'input',
                  inputType: 'text',
                  required: true
                }
              ]}
              initialData={{
                iteration: editingChecklistItem?.iteration || activeIterationId,
                name: editingChecklistItem?.name || ''
              }}
              title=""
              onSubmit={async (data) => {
                try {
                  await apiCall(`/pm-automation/pm-iteration-checklist/${editingChecklistItem.id}`, {
                    method: 'PATCH',
                    body: {
                      name: data.name
                    }
                  });
                  
                  toast({
                    title: "Success",
                    description: "Checklist item updated successfully"
                  });
                  
                  // Refresh the data
                  queryClient.invalidateQueries({
                    queryKey: ['/pm-automation/pm-iteration-checklist']
                  });
                  
                  setIsEditChecklistDialogOpen(false);
                  setEditingChecklistItem(null);
                 } catch (error) {
                   handleApiError(error, "Update Failed");
                 }
              }}
              submitText="Update Checklist Item"
            />
          </DialogContent>
        </Dialog>

     </div>
  );
};

export default PMSettingsSelector;