import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiCall } from '@/utils/apis';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import ApiInput from './ApiInput';
import { useToast } from '@/hooks/use-toast';

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
  const [isAddingIteration, setIsAddingIteration] = useState(false);
  const [multiplierValue, setMultiplierValue] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Handle creating new iteration
  const handleCreateIteration = async () => {
    if (!selectedPMSetting || !multiplierValue) return;

    setIsSubmitting(true);
    try {
      const intervalValue = selectedPMSetting.interval_value * parseFloat(multiplierValue);
      const name = `${intervalValue} ${selectedPMSetting.interval_unit}`;

      await apiCall('/pm-automation/pm-iterations', {
        method: 'POST',
        body: {
          pm_settings: selectedPMSettingId,
          interval_value: intervalValue,
          name: name
        }
      });

      // Refresh the PM settings data
      queryClient.invalidateQueries({
        queryKey: ['/pm-automation/pm-settings']
      });

      // Reset form
      setIsAddingIteration(false);
      setMultiplierValue('');
      
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
    } finally {
      setIsSubmitting(false);
    }
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
          <h3 className="text-lg font-semibold">Iterations</h3>
          <div className="flex items-center gap-2">
            {iterations.length > 0 ? (
              <Tabs value={activeIterationId} onValueChange={setActiveIterationId}>
                <TabsList className="w-fit grid gap-1" style={{ gridTemplateColumns: `repeat(${iterations.length}, minmax(0, 1fr))` }}>
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
            ) : (
              <div className="text-muted-foreground">No iterations found for this PM setting.</div>
            )}
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsAddingIteration(true)}
              disabled={!selectedPMSetting}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Add New Iteration Form */}
          {isAddingIteration && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Iteration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Base interval: {selectedPMSetting.interval_value} {selectedPMSetting.interval_unit}
                  </p>
                  <ApiInput
                    name="multiplier"
                    label="Multiplier"
                    placeholder="Enter multiplier (e.g., 2 for double the interval)"
                    value={multiplierValue}
                    onChange={setMultiplierValue}
                    type="number"
                    required
                  />
                  {multiplierValue && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Result: {selectedPMSetting.interval_value * parseFloat(multiplierValue || '0')} {selectedPMSetting.interval_unit}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleCreateIteration}
                    disabled={!multiplierValue || isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Iteration'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setIsAddingIteration(false);
                      setMultiplierValue('');
                    }}
                  >
                    Cancel
                  </Button>
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