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
      
      await apiCall('/pm-automation/pm-settings-checklist', {
        method: 'POST',
        body: JSON.stringify(data),
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
        <div className="flex items-end border-b border-border/30 px-4">
          <TabsList className="h-auto bg-transparent p-0 flex items-end gap-1">
            {tabs.map((tab) => (
              <div key={tab.id} className="relative group">
                <TabsTrigger
                  value={tab.id}
                  className="relative bg-card border border-border border-b-0 rounded-t-md px-3 py-2 text-xs font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:border-primary/30 data-[state=active]:shadow-sm hover:bg-muted/50 -mb-px"
                >
                  {tab.name}
                  {!tab.isDefault && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTab(tab.id);
                      }}
                      className="ml-2 w-3 h-3 rounded-full bg-destructive/20 hover:bg-destructive/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-2 h-2 text-destructive" />
                    </button>
                  )}
                </TabsTrigger>
              </div>
            ))}
            
            {/* Add Tab Button */}
            {!isAddingTab ? (
              <button
                onClick={() => setIsAddingTab(true)}
                className="ml-2 w-8 h-8 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-t-md flex items-center justify-center transition-all duration-200 hover:scale-105 -mb-px"
              >
                <Plus className="w-3 h-3 text-primary" />
              </button>
            ) : (
              <div className="ml-2 flex items-center gap-1 -mb-px">
                <input
                  type="text"
                  value={newTabName}
                  onChange={(e) => setNewTabName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddTab();
                    if (e.key === 'Escape') {
                      setIsAddingTab(false);
                      setNewTabName('');
                    }
                  }}
                  placeholder="Tab name"
                  className="w-20 px-2 py-1 text-xs border border-border rounded-t-md bg-background focus:outline-none focus:border-primary"
                  autoFocus
                />
                <button
                  onClick={handleAddTab}
                  className="w-6 h-6 bg-green-500/20 hover:bg-green-500/40 rounded flex items-center justify-center"
                >
                  <Plus className="w-3 h-3 text-green-600" />
                </button>
                <button
                  onClick={() => {
                    setIsAddingTab(false);
                    setNewTabName('');
                  }}
                  className="w-6 h-6 bg-destructive/20 hover:bg-destructive/40 rounded flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-destructive" />
                </button>
              </div>
            )}
          </TabsList>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="h-full m-0">
              <div className="grid grid-cols-2 gap-8 h-full">
                
                {/* Checklist Section */}
                <div className="border border-border/20 rounded-lg p-4 bg-card">
                  <h5 className="text-sm font-medium text-foreground mb-4 border-b border-border/20 pb-2">
                    Checklist
                  </h5>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <ApiTable
                        endpoint="/pm-automation/pm-settings-checklist"
                        filters={{
                          pm_settings: selectedPmId
                        }}
                        columns={[
                          { key: "name", header: "Name", type: "string" }
                        ]}
                      />
                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Item
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Checklist Item</DialogTitle>
                          </DialogHeader>
                          <ApiForm
                            fields={[
                              { name: "name", label: "Name", type: "input", inputType: "text" },
                              { name: "pm_settings", label: "", type: "input", inputType: "hidden" }
                            ]}
                            initialData={{ pm_settings: selectedPmId }}
                            onSubmit={handleSubmitChecklistItem}
                            submitText="Add Item"
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>

                {/* Parts Section */}
                <div className="border border-border/20 rounded-lg p-4 bg-card">
                  <h5 className="text-sm font-medium text-foreground mb-4 border-b border-border/20 pb-2">
                    Parts
                  </h5>
                </div>

              </div>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
};

export default PMChecklistTabs;
