import React, { useState } from 'react';
import { ChevronLeft, Plus, X } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { apiCall } from '@/utils/apis';
import ApiTable from './ApiTable';
import ApiForm from './ApiForm';
import PMSettingsSelector from './PMSettingsSelector';

interface PMChecklistTabsProps {
  assetId: string;
  selectedPmId?: string | null;
  onNavigateBack: () => void;
}

interface TabItem {
  id: string;
  name: string;
  isDefault: boolean;
}

const PMChecklistTabs: React.FC<PMChecklistTabsProps> = ({ assetId, selectedPmId, onNavigateBack }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tabs, setTabs] = useState<TabItem[]>([
    { id: '500-hour', name: '500 HOUR', isDefault: true },
    { id: '1000-hour', name: '1000 HOUR', isDefault: true },
    { id: '2000-hour', name: '2000 HOUR', isDefault: true }
  ]);
  const [activeTab, setActiveTab] = useState('500-hour');
  const [newTabName, setNewTabName] = useState('');
  const [isAddingTab, setIsAddingTab] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmitChecklistItem = async (data: Record<string, any>) => {
    try {
      console.log('Submitting checklist item:', data);
      console.log('Selected PM ID:', selectedPmId);
      
      // Ensure pm_settings is included in the payload
      const submitData = {
        ...data,
        pm_settings: selectedPmId
      };
      
      console.log('Final submit data:', submitData);
      
      await apiCall('/pm-automation/pm-settings-checklist', {
        method: 'POST',
        body: JSON.stringify(submitData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      toast({
        title: "Success",
        description: "Checklist item added successfully",
      });

      // Refresh the table data
      queryClient.invalidateQueries({ 
        queryKey: ['/pm-automation/pm-settings-checklist', { pm_settings: selectedPmId }] 
      });

      // Close the dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error submitting checklist item:', error);
      toast({
        title: "Error",
        description: "Failed to add checklist item",
        variant: "destructive",
      });
    }
  };

  const handleAddTab = () => {
    if (newTabName.trim()) {
      const newTab: TabItem = {
        id: `custom-${Date.now()}`,
        name: newTabName.trim(),
        isDefault: false
      };
      setTabs([...tabs, newTab]);
      setActiveTab(newTab.id);
      setNewTabName('');
      setIsAddingTab(false);
    }
  };

  const handleRemoveTab = (tabId: string) => {
    const tabToRemove = tabs.find(tab => tab.id === tabId);
    if (tabToRemove && !tabToRemove.isDefault) {
      const newTabs = tabs.filter(tab => tab.id !== tabId);
      setTabs(newTabs);
      if (activeTab === tabId) {
        setActiveTab(newTabs[0]?.id || '');
      }
    }
  };

  return (
    <div className="h-full flex flex-col">

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        {/* Tab Headers */}

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          <TabsContent value="pm-settings" className="h-full m-0">
            <PMSettingsSelector assetId={assetId} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default PMChecklistTabs;
