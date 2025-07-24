import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiCall } from '@/utils/apis';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Plus, Check, X } from 'lucide-react';
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
  const [isCreatingIteration, setIsCreatingIteration] = useState(false);
  const [newIterationMultiplier, setNewIterationMultiplier] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    if (iterations.length > 0 && !activeIterationId && !isCreatingIteration) {
      setActiveIterationId(iterations[0].id);
    }
  }, [iterations, activeIterationId, isCreatingIteration]);

  const handleAddIteration = () => {
    setIsCreatingIteration(true);
    setActiveIterationId('new');
    setNewIterationMultiplier('');
  };

  const handleCancelNewIteration = () => {
    setIsCreatingIteration(false);
    setNewIterationMultiplier('');
    if (iterations.length > 0) {
      setActiveIterationId(iterations[0].id);
    }
  };

  const handleSaveNewIteration = async () => {
    if (!selectedPMSetting || !newIterationMultiplier) return;

    const multiplier = parseInt(newIterationMultiplier);
    if (isNaN(multiplier) || multiplier <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid positive whole number",
        variant: "destructive",
      });
      return;
    }

    const intervalValue = selectedPMSetting.interval_value * multiplier;
    const iterationName = `${intervalValue} ${selectedPMSetting.interval_unit}`;

    setIsSubmitting(true);
    try {
      await apiCall('/pm-automation/pm-iterations', {
        method: 'POST',
        body: {
          pm_settings: selectedPMSetting.id,
          interval_value: intervalValue,
          name: iterationName,
        },
      });

      // Refresh the data
      queryClient.invalidateQueries({ queryKey: ['/pm-automation/pm-settings'] });
      
      setIsCreatingIteration(false);
      setNewIterationMultiplier('');
      
      toast({
        title: "Success",
        description: "New iteration created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create iteration",
        variant: "destructive",
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
      {(iterations.length > 0 || selectedPMSetting) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Iterations</h3>
            {selectedPMSetting && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddIteration}
                disabled={isCreatingIteration}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <Tabs value={activeIterationId} onValueChange={setActiveIterationId}>
            <div className="flex items-center gap-2">
              <TabsList className="w-fit flex gap-1">
                {iterations
                  .sort((a, b) => a.order - b.order)
                  .map((iteration) => (
                    <TabsTrigger key={iteration.id} value={iteration.id}>
                      {iteration.name}
                    </TabsTrigger>
                  ))}
                {isCreatingIteration && (
                  <TabsTrigger value="new">
                    New Iteration
                  </TabsTrigger>
                )}
              </TabsList>
            </div>
            
            {iterations.map((iteration) => (
              <TabsContent key={iteration.id} value={iteration.id}>
                {/* Iteration content can be added here */}
              </TabsContent>
            ))}
            
            {isCreatingIteration && (
              <TabsContent value="new">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="multiplier">
                          Multiplier (base interval: {selectedPMSetting?.interval_value} {selectedPMSetting?.interval_unit})
                        </Label>
                        <Input
                          id="multiplier"
                          type="number"
                          min="1"
                          step="1"
                          value={newIterationMultiplier}
                          onChange={(e) => setNewIterationMultiplier(e.target.value)}
                          placeholder="Enter whole number (e.g. 2 for double interval)"
                        />
                        {newIterationMultiplier && selectedPMSetting && (
                          <div className="text-sm text-muted-foreground">
                            Result: {selectedPMSetting.interval_value * parseInt(newIterationMultiplier || '0')} {selectedPMSetting.interval_unit}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveNewIteration}
                          disabled={!newIterationMultiplier || isSubmitting}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          {isSubmitting ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelNewIteration}
                          disabled={isSubmitting}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
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