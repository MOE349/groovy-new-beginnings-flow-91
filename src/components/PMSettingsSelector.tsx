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
import { useToast } from './ui/use-toast';

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


      {/* Iterations Tabs */}
      {selectedPMSetting && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
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
                      toast({
                        title: "Error",
                        description: "Failed to create iteration",
                        variant: "destructive"
                      });
                    }
                  }}
                  submitText="Create Iteration"
                />
              </DialogContent>
            </Dialog>
          </div>
          
          {iterations.length > 0 && (
            <Tabs value={activeIterationId} onValueChange={setActiveIterationId}>
              <TabsList className="w-fit grid grid-cols-3 gap-1">
                {iterations
                  .sort((a, b) => a.order - b.order)
                  .map((iteration) => (
                    <TabsTrigger key={iteration.id} value={iteration.id} className="group relative">
                      {iteration.name}
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
                            toast({
                              title: "Error",
                              description: "Failed to delete iteration",
                              variant: "destructive"
                            });
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-destructive/80 transition-opacity"
                      >
                        ×
                      </button>
                    </TabsTrigger>
                  ))}
              </TabsList>
              
              {iterations.map((iteration) => (
                <TabsContent key={iteration.id} value={iteration.id}>
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

    </div>
  );
};

export default PMSettingsSelector;