import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiCall } from '@/utils/apis';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

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


      {/* Iterations Tabs */}
      {iterations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Iterations</h3>
          <Tabs value={activeIterationId} onValueChange={setActiveIterationId}>
            <TabsList className="grid w-full grid-cols-3">
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