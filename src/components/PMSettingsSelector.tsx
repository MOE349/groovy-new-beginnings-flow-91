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
import { toast } from '@/hooks/use-toast';
import ApiForm from './ApiForm';

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

  // Form submission handler for new iteration
  const handleIterationSubmit = async (data: Record<string, any>) => {
    try {
      await apiCall('/pm-automation/pm-iterations', {
        method: 'POST',
        body: data
      });
      
      // Refresh the PM settings data
      queryClient.invalidateQueries({ queryKey: ['/pm-automation/pm-settings', { object_id: assetId }] });
      
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "New iteration created successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error", 
        description: error.message || "Failed to create iteration",
        variant: "destructive",
      });
    }
  };

  // Form fields for new iteration
  const iterationFormFields = selectedPMSetting ? [
    {
      name: 'pm_settings',
      label: '',
      type: 'input' as const,
      inputType: 'hidden' as const,
      required: true
    },
    {
      name: 'interval_value',
      label: 'Interval Value (Multiplier)',
      type: 'input' as const, 
      inputType: 'number' as const,
      placeholder: `Enter multiplier of ${selectedPMSetting.interval_value}`,
      required: true
    },
    {
      name: 'name',
      label: '',
      type: 'input' as const,
      inputType: 'hidden' as const,
      required: true
    }
  ] : [];

  const getInitialFormData = () => {
    if (!selectedPMSetting) return {};
    
    return {
      pm_settings: selectedPMSettingId,
      interval_value: selectedPMSetting.interval_value,
      name: `${selectedPMSetting.interval_value} ${selectedPMSetting.interval_unit}`
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading PM settings...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* PM Settings Dropdown */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Select PM Settings</label>
        <Select value={selectedPMSettingId} onValueChange={setSelectedPMSettingId}>
          <SelectTrigger>
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

      {/* PM Settings Details */}
      {selectedPMSetting && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{selectedPMSetting.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Interval:</span>
                <span className="ml-2">{selectedPMSetting.interval_value} {selectedPMSetting.interval_unit}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={selectedPMSetting.is_active ? "default" : "secondary"} className="ml-2">
                  {selectedPMSetting.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Iterations Section */}
      {selectedPMSetting && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Iterations</h3>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 w-8 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Iteration</DialogTitle>
                </DialogHeader>
                <ApiForm
                  fields={iterationFormFields}
                  onSubmit={handleIterationSubmit}
                  submitText="Create Iteration"
                  initialData={getInitialFormData()}
                />
              </DialogContent>
            </Dialog>
          </div>

          {iterations.length > 0 ? (
            <Tabs value={activeIterationId} onValueChange={setActiveIterationId}>
              <TabsList className={`grid w-full ${iterations.length === 1 ? 'grid-cols-1' : iterations.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {iterations
                  .sort((a, b) => a.order - b.order)
                  .map((iteration) => (
                    <TabsTrigger key={iteration.id} value={iteration.id}>
                      {iteration.name}
                    </TabsTrigger>
                  ))}
              </TabsList>
              
              {iterations.map((iteration) => (
                <TabsContent key={iteration.id} value={iteration.id}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">{iteration.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Interval Value:</span>
                          <span className="ml-2">{iteration.interval_value} hours</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Order:</span>
                          <span className="ml-2">{iteration.order}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Checklist Items:</span>
                          <span className="ml-2">{iteration.checklist_items.length} items</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  No iterations found for this PM setting.
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