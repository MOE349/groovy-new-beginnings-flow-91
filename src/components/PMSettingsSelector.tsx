import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiCall } from '@/utils/apis';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Plus, Trash2 } from 'lucide-react';
import ApiForm from './ApiForm';
import { useToast } from './ui/use-toast';
import { handleApiError } from '@/utils/errorHandling';

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

const ChecklistTable: React.FC<{ iteration: Iteration }> = ({ iteration }) => {
  const [isChecklistDialogOpen, setIsChecklistDialogOpen] = useState(false);
  const [isEditChecklistDialogOpen, setIsEditChecklistDialogOpen] = useState(false);
  const [editingChecklistItem, setEditingChecklistItem] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch checklist items for the iteration
  const { data: checklistItems, isLoading } = useQuery({
    queryKey: ['/pm-automation/pm-iteration-checklist', { iteration: iteration.id }],
    queryFn: async () => {
      const response = await apiCall(`/pm-automation/pm-iteration-checklist?iteration=${iteration.id}`, {
        method: 'GET'
      });
      return response.data?.data || [];
    }
  });

  const handleDelete = async (item: any) => {
    try {
      await apiCall(`/pm-automation/pm-iteration-checklist/${item.id}`, {
        method: 'DELETE'
      });
      toast({
        title: "Success",
        description: "Checklist item deleted successfully"
      });
      queryClient.invalidateQueries({
        queryKey: ['/pm-automation/pm-iteration-checklist']
      });
    } catch (error) {
      handleApiError(error, "Delete Failed");
    }
  };

  return (
    <div className="w-1/2">
      <Card className="p-2">
        {/* Fixed Header */}
        <CardHeader className="py-2 px-3">
          <div className="flex items-center justify-between">
            <CardTitle>Checklist Items</CardTitle>
            <Button 
              onClick={() => setIsChecklistDialogOpen(true)}
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Checklist Item
            </Button>
          </div>
        </CardHeader>
        
        {/* Fixed Table Header */}
        <div className="px-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="w-8"></TableHead>
              </TableRow>
            </TableHeader>
          </Table>
        </div>
        
        {/* Scrollable Body */}
        <CardContent className="p-0">
          <ScrollArea className="h-80">
            <div className="px-3">
              <Table>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : checklistItems && checklistItems.length > 0 ? (
                    checklistItems.map((item: any) => (
                      <TableRow 
                        key={item.id}
                        className="group cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => {
                          setEditingChecklistItem(item);
                          setIsEditChecklistDialogOpen(true);
                        }}
                      >
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="w-8 p-0">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        No checklist items found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Checklist Item Creation Dialog */}
      <Dialog open={isChecklistDialogOpen} onOpenChange={setIsChecklistDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Checklist Item</DialogTitle>
          </DialogHeader>
          <ApiForm
            fields={[
              {
                name: 'iteration',
                label: 'Iteration',
                type: 'input',
                inputType: 'hidden'
              },
              {
                name: 'name',
                label: 'Checklist Item Name',
                type: 'input',
                inputType: 'text',
                required: true
              }
            ]}
            initialData={{
              iteration: iteration.id,
              name: ''
            }}
            title=""
            onSubmit={async (data) => {
              try {
                await apiCall('/pm-automation/pm-iteration-checklist', {
                  method: 'POST',
                  body: {
                    iteration: iteration.id,
                    name: data.name
                  }
                });
                
                toast({
                  title: "Success",
                  description: "Checklist item created successfully"
                });
                
                queryClient.invalidateQueries({
                  queryKey: ['/pm-automation/pm-iteration-checklist']
                });
                
                setIsChecklistDialogOpen(false);
              } catch (error) {
                handleApiError(error, "Creation Failed");
              }
            }}
            submitText="Create Checklist Item"
          />
        </DialogContent>
      </Dialog>

      {/* Checklist Item Edit Dialog */}
      <Dialog open={isEditChecklistDialogOpen} onOpenChange={setIsEditChecklistDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Checklist Item</DialogTitle>
          </DialogHeader>
          <ApiForm
            fields={[
              {
                name: 'iteration',
                label: 'Iteration',
                type: 'input',
                inputType: 'hidden'
              },
              {
                name: 'name',
                label: 'Checklist Item Name',
                type: 'input',
                inputType: 'text',
                required: true
              }
            ]}
            initialData={{
              iteration: editingChecklistItem?.iteration || iteration.id,
              name: editingChecklistItem?.name || ''
            }}
            title=""
            onSubmit={async (data) => {
              try {
                await apiCall(`/pm-automation/pm-iteration-checklist/${editingChecklistItem.id}`, {
                  method: 'PATCH',
                  body: {
                    name: data.name
                  }
                });
                
                toast({
                  title: "Success",
                  description: "Checklist item updated successfully"
                });
                
                queryClient.invalidateQueries({
                  queryKey: ['/pm-automation/pm-iteration-checklist']
                });
                
                setIsEditChecklistDialogOpen(false);
                setEditingChecklistItem(null);
              } catch (error) {
                handleApiError(error, "Update Failed");
              }
            }}
            submitText="Update Checklist Item"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const PMSettingsSelector: React.FC<PMSettingsSelectorProps> = ({ assetId }) => {
  const [selectedPMSettingId, setSelectedPMSettingId] = useState<string>('');
  const [activeIterationId, setActiveIterationId] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading PM settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="relative flex items-center gap-4 py-1">
        {/* Empty space on left for balance */}
        <div></div>

        {/* Select PM Settings moved slightly left */}
        <div className="absolute left-1/2 transform -translate-x-1/2 top-2 flex items-center gap-4">
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
        </div>

        {/* Empty space on right for balance */}
        <div></div>
      </div>


      {/* Iterations Tabs - moved up */}
      {selectedPMSetting && (
        <div>
          {iterations.length > 0 && (
            <Tabs value={activeIterationId} onValueChange={setActiveIterationId}>
              <TabsList className="w-fit flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
                {iterations
                  .sort((a, b) => a.order - b.order)
                  .map((iteration, index) => (
                     <TabsTrigger 
                       key={iteration.id} 
                       value={iteration.id} 
                       className="group relative px-4 py-1 rounded-md bg-transparent text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 hover:bg-background hover:text-foreground font-medium text-sm min-w-[80px]"
                     >
                      {iteration.name}
                      {index > 0 && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await apiCall(`/pm-automation/pm-iterations/${iteration.id}`, {
                                method: 'DELETE'
                              });
                              toast({
                                title: "Success",
                                description: "Iteration deleted successfully"
                              });
                              queryClient.invalidateQueries({
                                queryKey: ['/pm-automation/pm-settings']
                              });
                            } catch (error) {
                              handleApiError(error, "Delete Failed");
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-destructive/80 transition-opacity"
                        >
                          ×
                        </button>
                      )}
                    </TabsTrigger>
                  ))}
                
                {/* Add new iteration button */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="px-3 py-1 h-8 ml-2">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Iteration</DialogTitle>
                    </DialogHeader>
                    <ApiForm
                      fields={[
                        {
                          name: 'pm_settings',
                          label: 'PM Settings',
                          type: 'input',
                          inputType: 'hidden'
                        },
                        {
                          name: 'interval_value',
                          label: `Interval Value (${selectedPMSetting.interval_unit})`,
                          type: 'input',
                          inputType: 'number',
                          required: true
                        },
                        {
                          name: 'name',
                          label: 'Name',
                          type: 'input',
                          inputType: 'hidden'
                        }
                      ]}
                      initialData={{
                        pm_settings: selectedPMSettingId,
                        name: ''
                      }}
                      title=""
                      onSubmit={async (data) => {
                        try {
                          const intervalValue = parseFloat(data.interval_value);
                          const name = `${intervalValue} ${selectedPMSetting.interval_unit}`;
                          
                          await apiCall('/pm-automation/pm-iterations', {
                            method: 'POST',
                            body: {
                              pm_settings: selectedPMSettingId,
                              interval_value: intervalValue,
                              name: name
                            }
                          });
                          
                          toast({
                            title: "Success",
                            description: "Iteration created successfully"
                          });
                          
                          // Refresh the data
                          queryClient.invalidateQueries({
                            queryKey: ['/pm-automation/pm-settings']
                          });
                          
                          setIsDialogOpen(false);
                        } catch (error) {
                          handleApiError(error, "Creation Failed");
                        }
                      }}
                      submitText="Create Iteration"
                    />
                  </DialogContent>
                </Dialog>
              </TabsList>
              
              {iterations.map((iteration) => (
                <TabsContent key={iteration.id} value={iteration.id}>
                  <ChecklistTable iteration={iteration} />
                </TabsContent>
              ))}
            </Tabs>
          )}
          
          {iterations.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  No iterations found for this PM setting. Click the + button to add one.
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