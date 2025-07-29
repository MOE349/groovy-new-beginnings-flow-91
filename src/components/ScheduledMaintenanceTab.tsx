import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import ApiDropDown from "@/components/ApiDropDown";
import { apiCall } from "@/utils/apis";
import PMChecklistTabs from "@/components/PMChecklistTabs";
import ApiInput from "@/components/ApiInput";
import ApiSwitch from "@/components/ApiSwitch";
import ApiDatePicker from "@/components/ApiDatePicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ScheduledMaintenanceTabProps {
  assetId: string;
  currentView: number;
  onViewChange: (viewIndex: number) => void;
  isEditMode: boolean;
  setIsEditMode: (edit: boolean) => void;
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
  selectedRadioId: string | null;
  setSelectedRadioId: (id: string | null) => void;
  isFieldsEditable: boolean;
  setIsFieldsEditable: (editable: boolean) => void;
  meterTriggerData: any;
  setMeterTriggerData: (data: any) => void;
  calendarTriggerData: any;
  setCalendarTriggerData: (data: any) => void;
  pmSettingsData: any;
  handleSaveCalendarTrigger: () => void;
}

const ScheduledMaintenanceTab = ({ 
  assetId, 
  currentView, 
  onViewChange,
  isEditMode,
  setIsEditMode,
  selectedItemId,
  setSelectedItemId,
  selectedRadioId,
  setSelectedRadioId,
  isFieldsEditable,
  setIsFieldsEditable,
  meterTriggerData,
  setMeterTriggerData,
  calendarTriggerData,
  setCalendarTriggerData,
  pmSettingsData,
  handleSaveCalendarTrigger
}: ScheduledMaintenanceTabProps) => {
  const queryClient = useQueryClient();
  const [selectedPmId, setSelectedPmId] = useState<string | null>(null);

  const handleSaveSettings = async () => {
    if (!isFieldsEditable) {
      setIsFieldsEditable(true);
      return;
    }
    
    const submissionData = {
      name: meterTriggerData.name,
      interval_value: meterTriggerData.interval_value,
      interval_unit: meterTriggerData.interval_unit,
      start_threshold_value: meterTriggerData.start_threshold_value,
      start_threshold_unit: meterTriggerData.interval_unit,
      lead_time_value: meterTriggerData.lead_time_value,
      lead_time_unit: meterTriggerData.interval_unit,
      next_iteration: meterTriggerData.next_iteration,
      is_active: meterTriggerData.is_active,
      asset: assetId
    };

    try {
      if (isEditMode && selectedItemId) {
        await apiCall(`/pm-automation/pm-settings/${selectedItemId}`, {
          method: 'PUT',
          body: submissionData
        });
        toast({
          title: "Success",
          description: "PM Trigger settings updated successfully!"
        });
      } else {
        await apiCall('/pm-automation/pm-settings', {
          method: 'POST',
          body: submissionData
        });
        toast({
          title: "Success",
          description: "PM Trigger settings created successfully!"
        });
      }
      setIsEditMode(false);
      setSelectedItemId(null);
      setIsFieldsEditable(false);
      queryClient.invalidateQueries({
        queryKey: [`/pm-automation/pm-settings?asset=${assetId}`]
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditMode ? 'update' : 'create'} PM Trigger settings`,
        variant: "destructive"
      });
    }
  };

  const handleGenerateWorkOrder = async () => {
    if (!selectedItemId) return;
    try {
      await apiCall(`/pm-automation/pm-settings/manual-generation/${selectedItemId}`, {
        method: 'POST'
      });
      toast({
        title: "Success",
        description: "Work order generated successfully!"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate work order",
        variant: "destructive"
      });
    }
  };

  const handleRowClick = (item: any, index: number) => {
    setSelectedRadioId(item?.id || index.toString());
    if (item) {
      setMeterTriggerData({
        name: item.name ?? "",
        interval_value: String(item.interval_value ?? ""),
        interval_unit: item.interval_unit ?? "hours",
        start_threshold_value: String(item.start_threshold_value ?? ""),
        lead_time_value: String(item.lead_time_value ?? ""),
        next_iteration: item.next_iteration ?? "",
        is_active: item.is_active !== undefined ? item.is_active : true
      });
      setIsEditMode(true);
      setSelectedItemId(item.id);
      setIsFieldsEditable(false);
    } else {
      setMeterTriggerData({
        name: "",
        interval_value: "",
        interval_unit: "hours",
        start_threshold_value: "",
        lead_time_value: "",
        next_iteration: "",
        is_active: true
      });
      setIsEditMode(false);
      setSelectedItemId(null);
      setIsFieldsEditable(true);
    }
  };

  if (currentView === 0) {
    return (
      <div className="tab-content-maintenance">
        <div className="flex gap-4 h-full relative animate-fade-in">
          <button 
            onClick={() => onViewChange(1)} 
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          >
            <ChevronRight className="w-4 h-4 text-primary" />
          </button>
          
          {/* Meter Reading Trigger Section */}
          <div className="w-1/4">
            <div className="px-4 pt-4 pb-0 h-full relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-col">
              <div className="flex items-center justify-center gap-4 mb-2 py-1 -mx-2 mt-0 bg-accent/20 border border-accent/30 rounded-md">
                <h5 className="text-xs font-medium text-primary dark:text-secondary">Meter Reading Trigger</h5>
              </div>
              
              <div className="mb-4">
                <div className="overflow-auto h-[120px]">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="h-6 px-2 py-1 text-left align-middle font-medium text-primary-foreground bg-primary text-xs w-8"></th>
                        <th className="h-6 px-2 py-1 text-left align-middle font-medium text-primary-foreground bg-primary text-xs">Name</th>
                        <th className="h-6 px-2 py-1 text-left align-middle font-medium text-primary-foreground bg-primary text-xs">Next Trigger</th>
                        <th className="h-6 px-2 py-1 text-left align-middle font-medium text-primary-foreground bg-primary text-xs">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 3 }, (_, i) => {
                        const item = pmSettingsData?.[i];
                        return (
                          <tr 
                            key={i} 
                            className="border-b cursor-pointer hover:bg-muted/50"
                            onClick={() => handleRowClick(item, i)}
                          >
                            <td className="px-2 py-1 text-left align-middle text-xs">
                              <input 
                                type="radio" 
                                name="pm-selection" 
                                value={item?.id || i} 
                                checked={selectedRadioId === (item?.id || i.toString())}
                                onChange={() => {}} // Row click handler manages the selection
                                className="w-3 h-3 pointer-events-none appearance-none border-2 border-muted-foreground/30 bg-background rounded-md checked:bg-primary checked:border-primary transition-all duration-200 relative checked:after:content-['✓'] checked:after:absolute checked:after:inset-0 checked:after:text-primary-foreground checked:after:text-[10px] checked:after:font-bold checked:after:flex checked:after:items-center checked:after:justify-center checked:after:leading-none"
                              />
                            </td>
                            <td className="px-2 py-1 text-left align-middle text-xs">
                              {item?.name || '-'}
                            </td>
                            <td className="px-2 py-1 text-left align-middle text-xs">
                              {item?.next_trigger_value || '-'}
                            </td>
                            <td className="px-2 py-1 text-left align-middle text-xs">
                              {item?.is_active ? 'Active' : item?.is_active === false ? 'Inactive' : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                <div className="px-2 pb-2 flex items-center gap-4 mt-6">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="text-secondary py-1 px-3 text-sm"
                    disabled={!selectedItemId}
                    onClick={handleGenerateWorkOrder}
                  >
                    Generate WO Now
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Next Iteration</span>
                    {selectedItemId ? (
                      <div className="next-iteration-dropdown">
                        <ApiDropDown
                          name="next_iteration"
                          value={meterTriggerData.next_iteration}
                          onChange={(value) => setMeterTriggerData(prev => ({
                            ...prev,
                            next_iteration: value
                          }))}
                          endpoint={`/pm-automation/pm-settings/manual-generation/${selectedItemId}`}
                          optionValueKey="id"
                          optionLabelKey="name"
                          placeholder="Select iteration"
                          disabled={!isFieldsEditable}
                          className="w-40 [&>button]:h-7 [&>button]:text-xs [&>button]:px-2 [&>button]:py-0 [&>button]:min-h-0 [&>button]:border-input [&>button]:bg-background [&>button]:hover:bg-accent [&>button]:focus:bg-accent [&>button]:rounded-sm [&>button]:shadow-sm [&>button]:transition-colors [&>button]:duration-150"
                        />
                      </div>
                    ) : (
                      <div className="w-40 h-7 px-2 text-xs border border-input rounded-sm flex items-center text-muted-foreground bg-muted/50 shadow-sm">
                        No PM setting selected
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Form inputs section */}
              <div className="flex-grow overflow-auto flex flex-col justify-end pb-4">
                <div className="space-y-1 border-2 border-dashed border-muted-foreground/30 rounded-md p-3 mb-3">
                  <div className="flex items-center">
                    <span className="text-xs text-muted-foreground w-16">Name</span>
                    <input 
                      type="text" 
                      value={meterTriggerData.name} 
                      onChange={e => setMeterTriggerData(prev => ({
                        ...prev,
                        name: e.target.value
                      }))} 
                      disabled={!isFieldsEditable}
                      className={`w-33 h-6 px-2 text-xs border rounded ${!isFieldsEditable ? 'bg-muted/50 text-muted-foreground cursor-not-allowed' : 'bg-background'}`}
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-xs text-muted-foreground w-16">Every</span>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          value={meterTriggerData.interval_value} 
                          onChange={e => setMeterTriggerData(prev => ({
                            ...prev,
                            interval_value: e.target.value
                          }))} 
                          disabled={!isFieldsEditable}
                          className={`w-16 h-6 px-2 text-xs border rounded ${!isFieldsEditable ? 'bg-muted/50 text-muted-foreground cursor-not-allowed' : 'bg-background'}`}
                        />
                        <select 
                          value={meterTriggerData.interval_unit} 
                          onChange={e => setMeterTriggerData(prev => ({
                            ...prev,
                            interval_unit: e.target.value
                          }))} 
                          disabled={!isFieldsEditable}
                          className={`h-6 px-2 text-xs border rounded w-20 ${!isFieldsEditable ? 'bg-muted/50 text-muted-foreground cursor-not-allowed' : 'bg-background'}`}
                        >
                          <option value="hours">hours</option>
                          <option value="km">km</option>
                          <option value="miles">miles</option>
                          <option value="cycles">cycles</option>
                          <option value="days">days</option>
                          <option value="weeks">weeks</option>
                          <option value="months">months</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Starting at</span>
                        <input 
                          type="number" 
                          value={meterTriggerData.start_threshold_value} 
                          onChange={e => setMeterTriggerData(prev => ({
                            ...prev,
                            start_threshold_value: e.target.value
                          }))} 
                          disabled={!isFieldsEditable}
                          className={`w-24 h-6 px-2 text-xs border rounded ${!isFieldsEditable ? 'bg-muted/50 text-muted-foreground cursor-not-allowed' : 'bg-background'}`}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-xs text-muted-foreground w-16">Create</span>
                    <input 
                      type="number" 
                      value={meterTriggerData.lead_time_value} 
                      onChange={e => setMeterTriggerData(prev => ({
                        ...prev,
                        lead_time_value: e.target.value
                      }))} 
                      disabled={!isFieldsEditable}
                      className={`w-16 h-6 px-2 text-xs border rounded ${!isFieldsEditable ? 'bg-muted/50 text-muted-foreground cursor-not-allowed' : 'bg-background'}`}
                    />
                    <span className="text-xs text-muted-foreground ml-2">before trigger</span>
                  </div>
                </div>
                
                <div>
                  <Button 
                    className={`w-full h-8 text-xs ${meterTriggerData.is_active ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-500 hover:bg-gray-600 text-white'}`} 
                    onClick={() => isFieldsEditable && setMeterTriggerData(prev => ({
                      ...prev,
                      is_active: !prev.is_active
                    }))}
                    disabled={!isFieldsEditable}
                  >
                    {meterTriggerData.is_active ? '✓ Active' : '✗ Inactive'}
                  </Button>
                </div>
                
                <div className="mt-0.5">
                  <Button 
                    className="w-full h-8 text-xs bg-primary hover:bg-primary/90 text-white" 
                    onClick={handleSaveSettings}
                  >
                    {!isFieldsEditable ? 'Edit' : (isEditMode ? 'Save' : 'Save')}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Trigger Section */}
          <div className="w-1/4">
            <div className="px-4 pt-4 pb-0 h-full relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-col">
              <div className="flex items-center justify-center gap-4 mb-2 py-1 -mx-2 mt-0 bg-accent/20 border border-accent/30 rounded-md">
                <h5 className="text-xs font-medium text-primary dark:text-secondary">Calendar Trigger</h5>
              </div>
              
              <div className="flex-grow overflow-auto flex flex-col justify-end pb-4">
                <div className="space-y-3 border-2 border-dashed border-muted-foreground/30 rounded-md p-3 mb-3">
                  <div className="space-y-2">
                    <ApiInput
                      name="calendar_name"
                      label="Name"
                      value={calendarTriggerData.name}
                      onChange={(value) => setCalendarTriggerData(prev => ({
                        ...prev,
                        name: value
                      }))}
                      className="text-xs [&>input]:h-6 [&>input]:text-xs [&>label]:text-xs"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-1/2">
                      <ApiInput
                        name="calendar_interval"
                        label="Every"
                        type="number"
                        value={String(calendarTriggerData.interval_value)}
                        onChange={(value) => setCalendarTriggerData(prev => ({
                          ...prev,
                          interval_value: parseInt(value) || 0
                        }))}
                        className="text-xs [&>input]:h-6 [&>input]:text-xs [&>label]:text-xs"
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="text-xs text-muted-foreground block mb-1">Unit</label>
                      <Select
                        value={calendarTriggerData.interval_unit}
                        onValueChange={(value) => setCalendarTriggerData(prev => ({
                          ...prev,
                          interval_unit: value
                        }))}
                      >
                        <SelectTrigger className="h-6 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="days">Days</SelectItem>
                          <SelectItem value="weeks">Weeks</SelectItem>
                          <SelectItem value="months">Months</SelectItem>
                          <SelectItem value="years">Years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <ApiDatePicker
                      name="start_date"
                      label="Start Date"
                      value={calendarTriggerData.start_date ? new Date(calendarTriggerData.start_date) : undefined}
                      onChange={(date) => setCalendarTriggerData(prev => ({
                        ...prev,
                        start_date: date ? date.toISOString().split('T')[0] : ""
                      }))}
                      className="text-xs [&>button]:h-6 [&>button]:text-xs [&>label]:text-xs"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <ApiInput
                      name="days_in_advance"
                      label="Days in Advance"
                      type="number"
                      value={String(calendarTriggerData.days_in_advance)}
                      onChange={(value) => setCalendarTriggerData(prev => ({
                        ...prev,
                        days_in_advance: parseInt(value) || 0
                      }))}
                      className="text-xs [&>input]:h-6 [&>input]:text-xs [&>label]:text-xs"
                    />
                  </div>
                </div>
                
                <div className="mb-1">
                  <ApiSwitch
                    name="calendar_active"
                    label={calendarTriggerData.is_active ? "Active" : "Inactive"}
                    checked={calendarTriggerData.is_active}
                    onChange={(checked) => setCalendarTriggerData(prev => ({
                      ...prev,
                      is_active: checked
                    }))}
                    className="text-xs [&>label]:text-xs"
                  />
                </div>
                
                <div className="mt-2">
                  <Button 
                    className="w-full h-8 text-xs bg-primary hover:bg-primary/90 text-white" 
                    onClick={handleSaveCalendarTrigger}
                  >
                    Save Calendar Trigger
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Log Section */}
          <div className="w-1/2">
            <div className="px-4 pt-4 pb-0 h-full relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-col">
              <div className="flex items-center justify-center gap-4 mb-2 py-1 -mx-2 mt-0 bg-accent/20 border border-accent/30 rounded-md">
                <h5 className="text-xs font-medium text-primary dark:text-secondary">Log</h5>
              </div>
              
              <div className="flex-1 flex flex-col p-4">
                <div className="mb-4">
                  <h6 className="text-xs font-medium text-muted-foreground mb-2">Auto Generated Work Orders</h6>
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full caption-bottom text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="h-8 px-2 py-1 text-left align-middle font-medium text-primary-foreground bg-primary text-xs">Code</th>
                          <th className="h-8 px-2 py-1 text-left align-middle font-medium text-primary-foreground bg-primary text-xs">Description</th>
                          <th className="h-8 px-2 py-1 text-left align-middle font-medium text-primary-foreground bg-primary text-xs">Status</th>
                          <th className="h-8 px-2 py-1 text-left align-middle font-medium text-primary-foreground bg-primary text-xs">Completion Meter Reading</th>
                          <th className="h-8 px-2 py-1 text-left align-middle font-medium text-primary-foreground bg-primary text-xs">Trigger Meter Reading</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="px-2 py-1 text-left align-middle text-xs">-</td>
                          <td className="px-2 py-1 text-left align-middle text-xs">-</td>
                          <td className="px-2 py-1 text-left align-middle text-xs">-</td>
                          <td className="px-2 py-1 text-left align-middle text-xs">-</td>
                          <td className="px-2 py-1 text-left align-middle text-xs">-</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="text-center mt-auto">
                  <Button
                    onClick={() => {
                      if (selectedItemId) {
                        setSelectedPmId(selectedItemId);
                        onViewChange(1);
                      } else {
                        toast({
                          title: "No PM Setting Selected",
                          description: "Please select a PM setting from the table first.",
                          variant: "destructive"
                        });
                      }
                    }}
                    className="w-full"
                  >
                    Manage Checklist
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Select a PM setting to manage its checklist items
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // View 1 - PM Checklist Management
  return (
    <div className="tab-content-maintenance">
      <div className="h-full relative animate-fade-in">
        <button
          onClick={() => onViewChange(0)}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
        >
          <ChevronLeft className="w-4 h-4 text-primary" />
        </button>
        
        <div className="h-full pl-12 pr-4">
          <PMChecklistTabs
            assetId={assetId}
            selectedPmId={selectedPmId}
            onNavigateBack={() => onViewChange(0)}
          />
        </div>
      </div>
    </div>
  );
};

export default ScheduledMaintenanceTab;