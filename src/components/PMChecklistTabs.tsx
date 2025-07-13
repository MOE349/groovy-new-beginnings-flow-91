import React, { useState } from 'react';
import { ChevronLeft, Plus, X } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';

interface PMChecklistTabsProps {
  assetId: string;
  onNavigateBack: () => void;
}

interface TabItem {
  id: string;
  name: string;
  isDefault: boolean;
}

const PMChecklistTabs: React.FC<PMChecklistTabsProps> = ({ assetId, onNavigateBack }) => {
  const [tabs, setTabs] = useState<TabItem[]>([
    { id: '500-hour', name: '500 HOUR', isDefault: true },
    { id: '1000-hour', name: '1000 HOUR', isDefault: true },
    { id: '2000-hour', name: '2000 HOUR', isDefault: true }
  ]);
  const [activeTab, setActiveTab] = useState('500-hour');
  const [newTabName, setNewTabName] = useState('');
  const [isAddingTab, setIsAddingTab] = useState(false);

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
    <div className="p-4 min-h-[400px] max-h-[70vh] lg:max-h-[60vh] xl:max-h-[65vh] 2xl:max-h-[70vh] relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b before:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl">
      
      {/* Left Arrow Navigation */}
      <button
        onClick={onNavigateBack}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
      >
        <ChevronLeft className="w-4 h-4 text-primary" />
      </button>

      {/* Title Header */}
      <div className="absolute top-1 left-8 right-8 flex items-center justify-center gap-4 py-1 bg-accent/20 border border-accent/30 rounded-md z-10">
        <h4 className="text-sm font-medium text-primary dark:text-secondary">PM Checklist/Parts</h4>
      </div>

      {/* Tabs Container */}
      <div className="mt-8 h-full flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          
          {/* Tab Headers with Folder Style */}
          <div className="flex items-end mb-2 border-b border-border/30">
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
              <TabsContent key={tab.id} value={tab.id} className="h-full mt-0">
                <div className="min-h-[300px] flex-1 border border-border/30 rounded-b-lg rounded-tr-lg bg-background/50 p-4 overflow-auto">
                  
                  {/* Responsive Layout: Checklist and Parts */}
                  <div className="grid lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-[1fr_1.2fr] gap-4 h-full">
                    
                    {/* Checklist Section */}
                    <div className="border border-border/20 rounded-lg p-3 bg-card/50">
                      <h5 className="text-sm font-medium text-foreground mb-3 border-b border-border/20 pb-2">
                        Checklist
                      </h5>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="w-3 h-3" />
                          <span>Check oil level</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="w-3 h-3" />
                          <span>Inspect belts</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="w-3 h-3" />
                          <span>Check filters</span>
                        </div>
                        <div className="text-xs text-muted-foreground/70 pt-2">
                          {tab.name} maintenance items...
                        </div>
                      </div>
                    </div>

                    {/* Parts Section */}
                    <div className="border border-border/20 rounded-lg p-3 bg-card/50">
                      <h5 className="text-sm font-medium text-foreground mb-3 border-b border-border/20 pb-2">
                        Parts
                      </h5>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Oil Filter</span>
                          <span className="text-xs">Qty: 1</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Air Filter</span>
                          <span className="text-xs">Qty: 1</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Hydraulic Oil</span>
                          <span className="text-xs">Qty: 5L</span>
                        </div>
                        <div className="text-xs text-muted-foreground/70 pt-2">
                          {tab.name} required parts...
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </TabsContent>
            ))}
          </div>

        </Tabs>
      </div>
    </div>
  );
};

export default PMChecklistTabs;