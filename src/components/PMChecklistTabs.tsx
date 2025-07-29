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
import { checklistItemFields } from '@/data/checklistFormFields';

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
    { id: 'iterations', name: 'Iterations', isDefault: true },
    { id: 'pm-settings', name: 'Select PM Settings', isDefault: true },
    { id: 'preventive-maintenance', name: 'Preventive Maintenance', isDefault: true },
    { id: '500-hour', name: '500.0 hours', isDefault: true },
    { id: '1000-hour', name: '1000 hours', isDefault: true },
    { id: '2000-hour', name: '2000 hours', isDefault: true }
  ]);
  const [activeTab, setActiveTab] = useState('iterations');
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
      {/* Header */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-primary">PM Checklist/Parts</h4>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        {/* Tab Headers */}
        <div className="border-b bg-muted/30 p-2 rounded-t-lg">
          <TabsList className="grid grid-cols-auto gap-1 h-auto p-1 bg-transparent">
            {tabs.map((tab) => (
              <div key={tab.id} className="relative group">
                <TabsTrigger 
                  value={tab.id} 
                  className="text-xs px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {tab.name}
                </TabsTrigger>
                {!tab.isDefault && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTab(tab.id);
                    }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                  >
                    <X className="w-2 h-2" />
                  </button>
                )}
              </div>
            ))}
            
            {/* Add Tab Button */}
            {isAddingTab ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={newTabName}
                  onChange={(e) => setNewTabName(e.target.value)}
                  placeholder="Tab name"
                  className="w-20 px-2 py-1 text-xs border rounded"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTab()}
                  autoFocus
                />
                <Button size="sm" onClick={handleAddTab} className="h-6 w-6 p-0">
                  ✓
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsAddingTab(false)} className="h-6 w-6 p-0">
                  ✗
                </Button>
              </div>
            ) : (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setIsAddingTab(true)}
                className="text-xs px-2 py-1 h-8"
              >
                <Plus className="w-3 h-3" />
              </Button>
            )}
          </TabsList>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden bg-card border border-t-0 rounded-b-lg">
          <TabsContent value="iterations" className="h-full m-0 p-4">
            <div className="text-center text-muted-foreground">
              <p>Iterations content goes here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="pm-settings" className="h-full m-0 p-4">
            <PMSettingsSelector assetId={assetId} />
          </TabsContent>
          
          <TabsContent value="preventive-maintenance" className="h-full m-0 p-4">
            <div className="text-center text-muted-foreground">
              <p>Preventive Maintenance content goes here</p>
            </div>
          </TabsContent>
          
          {/* Hour-based tabs and custom tabs */}
          {tabs.filter(tab => ['500-hour', '1000-hour', '2000-hour'].includes(tab.id) || !tab.isDefault).map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="h-full m-0 flex flex-col">
              <div className="border-b p-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-medium">Checklist Items</h5>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="text-xs">
                        <Plus className="w-3 h-3 mr-1" />
                        Add Checklist Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add Checklist Item</DialogTitle>
                      </DialogHeader>
                      <ApiForm
                        fields={checklistItemFields}
                        onSubmit={handleSubmitChecklistItem}
                        submitText="Add Item"
                        className="space-y-4"
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              <div className="flex-1 p-4">
                {selectedPmId ? (
                  <ApiTable
                    endpoint="/pm-automation/pm-settings-checklist"
                    columns={[
                      { key: "name", header: "Task Name" },
                      { key: "description", header: "Description" },
                      { key: "category.name", header: "Category" },
                      { key: "sequence_order", header: "Order" },
                      { key: "is_required", header: "Required" },
                      { key: "estimated_duration", header: "Duration (min)" }
                    ]}
                    queryKey={['/pm-automation/pm-settings-checklist', selectedPmId || '']}
                    tableId={`checklist-items-${tab.id}`}
                    filters={{ pm_settings: selectedPmId }}
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <p>Please select a PM setting to view checklist items</p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
};

export default PMChecklistTabs;