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
import { toast } from '@/hooks/use-toast';

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

  // Handle form submission for new iteration
  const handleIterationSubmit = async (formData: any) => {
    try {
      await apiCall('/pm-automation/pm-iterations', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      // Refresh the PM settings data
      queryClient.invalidateQueries({ queryKey: ['/pm-automation/pm-settings'] });
      
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "New iteration created successfully"
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to create iteration",
        variant: "destructive"
      });
    }
  };

  // Form fields for new iteration
  const iterationFormFields = [
    {
      name: 'interval_value',
      label: 'Interval Value (Multiplier)',
      type: 'input' as const,
      inputType: 'number' as const,
      required: true,
      placeholder: `Enter multiplier (e.g., 2 for ${selectedPMSetting ? selectedPMSetting.interval_value * 2 : 'double'} ${selectedPMSetting?.interval_unit || ''})`
    }
  ];

  // Prepare form data with hidden fields
  const getFormDataWithHiddenFields = (formData: any) => {
    const intervalValue = parseInt(formData.interval_value) * (selectedPMSetting?.interval_value || 1);
    return {
      ...formData,
      pm_settings: selectedPMSettingId,
      interval_value: intervalValue,
      name: `${intervalValue} ${selectedPMSetting?.interval_unit || ''}`
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
                  Add Iteration
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Iteration</DialogTitle>
                </DialogHeader>
                <ApiForm
                  fields={iterationFormFields}
                  onSubmit={(formData) => handleIterationSubmit(getFormDataWithHiddenFields(formData))}
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
                    <TabsTrigger key={iteration.id} value={iteration.id}>
                      {iteration.name}
                    </TabsTrigger>
                  ))}
              </TabsList>
              
              {iterations.map((iteration) => (
                <TabsContent key={iteration.id} value={iteration.id}>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      )}

      {/* No iterations message */}
      {selectedPMSetting && iterations.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              No iterations found for this PM setting.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PMSettingsSelector;