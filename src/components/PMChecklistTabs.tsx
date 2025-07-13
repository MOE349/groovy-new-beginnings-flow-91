import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface PMTab {
  id: string;
  name: string;
  checklist: string[];
  parts: string[];
}

export const PMChecklistTabs: React.FC = () => {
  const [tabs, setTabs] = useState<PMTab[]>([
    { id: '500', name: '500 HOUR', checklist: [], parts: [] },
    { id: '1000', name: '1000 HOUR', checklist: [], parts: [] },
    { id: '2000', name: '2000 HOUR', checklist: [], parts: [] },
  ]);
  const [activeTab, setActiveTab] = useState('500');
  const [newTabName, setNewTabName] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddTab = () => {
    if (newTabName.trim()) {
      const newTab: PMTab = {
        id: Date.now().toString(),
        name: newTabName.trim(),
        checklist: [],
        parts: [],
      };
      setTabs([...tabs, newTab]);
      setNewTabName('');
      setIsAddDialogOpen(false);
      setActiveTab(newTab.id);
    }
  };

  const handleRemoveTab = (tabId: string) => {
    if (tabs.length > 1) {
      const newTabs = tabs.filter(tab => tab.id !== tabId);
      setTabs(newTabs);
      if (activeTab === tabId) {
        setActiveTab(newTabs[0]?.id || '');
      }
    }
  };

  return (
    <div className="w-full h-full pt-12">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-accent/10 border border-accent/20">
            {tabs.map((tab) => (
              <div key={tab.id} className="relative group">
                <TabsTrigger 
                  value={tab.id}
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-sm font-medium px-4 py-2"
                >
                  {tab.name}
                </TabsTrigger>
                {tabs.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTab(tab.id);
                    }}
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive/10 hover:bg-destructive/20 border border-destructive/30"
                  >
                    <X className="h-3 w-3 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </TabsList>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 border-primary/30 hover:bg-primary/10"
              >
                <Plus className="h-4 w-4 text-primary" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Tab</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Enter tab name (e.g., 3000 HOUR)"
                  value={newTabName}
                  onChange={(e) => setNewTabName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTab()}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddTab} disabled={!newTabName.trim()}>
                    Add Tab
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-0 h-full">
            <div className="grid grid-cols-2 gap-6 h-full">
              {/* Checklist Section */}
              <div className="bg-card/50 border border-border/50 rounded-lg p-4">
                <h4 className="text-h4 font-medium text-foreground mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Checklist
                </h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="p-3 bg-muted/30 rounded border border-dashed border-border">
                    Checklist items for {tab.name} will be added here
                  </div>
                  <div className="text-xs text-muted-foreground/70">
                    • Add maintenance tasks
                    • Set completion requirements
                    • Track progress
                  </div>
                </div>
              </div>

              {/* Parts Section */}
              <div className="bg-card/50 border border-border/50 rounded-lg p-4">
                <h4 className="text-h4 font-medium text-foreground mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  Parts
                </h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="p-3 bg-muted/30 rounded border border-dashed border-border">
                    Parts and components for {tab.name} will be listed here
                  </div>
                  <div className="text-xs text-muted-foreground/70">
                    • Required parts inventory
                    • Part numbers & specifications
                    • Supplier information
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};