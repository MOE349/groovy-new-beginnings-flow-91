import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import ApiForm from "@/components/ApiForm";
import { handleApiError } from "@/utils/errorHandling";
import ApiTable from "@/components/ApiTable";
import ApiDropDown from "@/components/ApiDropDown";
import { apiCall } from "@/utils/apis";
import GearSpinner from "@/components/ui/gear-spinner";
import { AlertTriangle, Trash2, Plus, Check, X, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAssetData } from "@/hooks/useAssetData";
import { useAssetSubmit } from "@/hooks/useAssetSubmit";
import { equipmentFields, attachmentFields } from "@/data/assetFormFields";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import FormLayout from "@/components/FormLayout";
import { equipmentFormConfig, attachmentFormConfig } from "@/config/formLayouts";
import FinancialsTabContent from "@/components/FinancialsTabContent";
import PartsBomTabContent from "@/components/PartsBomTabContent";
import PMChecklistTabs from "@/components/PMChecklistTabs";
import AssetTabsContainer from "@/components/AssetTabsContainer";
import ApiSwitch from "@/components/ApiSwitch";
import ApiDatePicker from "@/components/ApiDatePicker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePrefetchFinancialData } from "@/hooks/useFinancialDataOptimized";

const EditAsset = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const prefetchFinancialData = usePrefetchFinancialData();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);
  const [isBacklogDialogOpen, setIsBacklogDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState(0);
  const [activeTab, setActiveTab] = useState("");
  const [isMeterTriggerActive, setIsMeterTriggerActive] = useState(true);
  const [isTimeTriggerActive, setIsTimeTriggerActive] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedRadioId, setSelectedRadioId] = useState<string | null>(null);
  const [isFieldsEditable, setIsFieldsEditable] = useState(false);

  const [meterTriggerData, setMeterTriggerData] = useState({
    name: "",
    interval_value: "",
    interval_unit: "hours",
    start_threshold_value: "",
    lead_time_value: "",
    next_iteration: "",
    is_active: true
  });

  const [calendarTriggerData, setCalendarTriggerData] = useState({
    name: "",
    interval_value: 30,
    interval_unit: "days",
    start_date: "",
    days_in_advance: 5,
    is_active: true
  });

  const { data: pmSettingsData } = useQuery({
    queryKey: [`/pm-automation/pm-settings?asset=${id}`],
    queryFn: async () => {
      const response = await apiCall(`/pm-automation/pm-settings?asset=${id}`);
      return response.data.data || response.data;
    },
  });

  const { assetType, assetData, isLoading, isError, error } = useAssetData(id);
  const { handleSubmit } = useAssetSubmit(id, assetType);

  useEffect(() => {
    if (id) {
      prefetchFinancialData(id);
    }
  }, [id, prefetchFinancialData]);

  useEffect(() => {
    if (activeTab !== "scheduled-maintenance") {
      setCurrentView(0);
    }
  }, [activeTab]);

  const handleViewChange = (viewIndex: number) => {
    setCurrentView(viewIndex);
  };

  const handleDeleteMeterReading = async (readingId: string) => {
    try {
      await apiCall(`/meter-readings/meter_reading/${readingId}`, {
        method: 'DELETE'
      });
      queryClient.invalidateQueries({
        queryKey: [`/meter-readings/meter_reading?asset=${id}`]
      });
      queryClient.invalidateQueries({
        queryKey: ["meter_readings", id]
      });
      toast({
        title: "Success",
        description: "Meter reading deleted successfully!"
      });
    } catch (error: any) {
      handleApiError(error, "Delete Failed");
    }
  };

  const handleDeleteCode = async (codeId: string) => {
    try {
      await apiCall(`/fault-codes/codes/${codeId}`, {
        method: 'DELETE'
      });
      queryClient.invalidateQueries({
        queryKey: [`/fault-codes/codes?asset=${id}`]
      });
      queryClient.invalidateQueries({
        queryKey: ["codes", id]
      });
      toast({
        title: "Success",
        description: "Code deleted successfully!"
      });
    } catch (error: any) {
      handleApiError(error, "Delete Failed");
    }
  };

  const handleSaveCalendarTrigger = async () => {
    try {
      const submissionData = {
        name: calendarTriggerData.name,
        interval_value: calendarTriggerData.interval_value,
        interval_unit: calendarTriggerData.interval_unit,
        start_date: calendarTriggerData.start_date,
        days_in_advance: calendarTriggerData.days_in_advance,
        is_active: calendarTriggerData.is_active,
        asset: id
      };
      await apiCall('/pm-automation/calendar-settings/', {
        method: 'POST',
        body: submissionData
      });
      toast({
        title: "Success",
        description: "Calendar Trigger settings saved successfully!"
      });
    } catch (error: any) {
      handleApiError(error, "Save Failed");
    }
  };

  const handleFinancialsTabHover = () => {
    if (id) {
      prefetchFinancialData(id);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[400px]">
        <GearSpinner fullscreen />
      </div>;
  }

  if (isError) {
    return <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load asset data: {error?.message || "Unknown error"}
          </AlertDescription>
        </Alert>
      </div>;
  }

  if (!assetType || !assetData) {
    return <div className="flex justify-center items-center min-h-[400px]">
        <GearSpinner fullscreen />
      </div>;
  }

  const currentFields = assetType === "equipment" ? equipmentFields : attachmentFields;
  const assetTypeName = assetType === "equipment" ? "Equipment" : "Attachment";

  const initialData = {
    ...assetData,
    purchase_date: assetData?.purchase_date ? new Date(assetData.purchase_date) : undefined,
    category: assetData?.category?.id || assetData?.category || "",
    location: assetData?.location?.id || assetData?.location || "",
    weight_class: assetData?.weight_class?.id || assetData?.weight_class || "",
    year: assetData?.year ? assetData.year.toString() : "",
    equipment: assetData?.equipment?.id || assetData?.equipment || "",
    project: assetData?.project?.id || assetData?.project || "",
    account_code: assetData?.account_code?.id || assetData?.account_code || "",
    job_code: assetData?.job_code?.id || assetData?.job_code || "",
    asset_status: assetData?.asset_status?.id || assetData?.asset_status || ""
  };

  const customLayout = (props: any) => <FormLayout {...props} config={assetType === "attachment" ? attachmentFormConfig : equipmentFormConfig} />;

  return <div className="h-full overflow-x-auto min-w-0 flex flex-col">
      <div className="space-y-4 min-w-[1440px] flex-1 flex flex-col">
        <div>
          <ApiForm fields={currentFields} onSubmit={handleSubmit} initialData={initialData} customLayout={customLayout} />
        </div>

        <AssetTabsContainer 
          assetId={id || ''} 
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          isCodeDialogOpen={isCodeDialogOpen}
          setIsCodeDialogOpen={setIsCodeDialogOpen}
          isBacklogDialogOpen={isBacklogDialogOpen}
          setIsBacklogDialogOpen={setIsBacklogDialogOpen}
          currentView={currentView}
          setCurrentView={setCurrentView}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMeterTriggerActive={isMeterTriggerActive}
          setIsMeterTriggerActive={setIsMeterTriggerActive}
          isTimeTriggerActive={isTimeTriggerActive}
          setIsTimeTriggerActive={setIsTimeTriggerActive}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          selectedItemId={selectedItemId}
          setSelectedItemId={setSelectedItemId}
          selectedRadioId={selectedRadioId}
          setSelectedRadioId={setSelectedRadioId}
          isFieldsEditable={isFieldsEditable}
          setIsFieldsEditable={setIsFieldsEditable}
          meterTriggerData={meterTriggerData}
          setMeterTriggerData={setMeterTriggerData}
          calendarTriggerData={calendarTriggerData}
          setCalendarTriggerData={setCalendarTriggerData}
          pmSettingsData={pmSettingsData}
          handleDeleteMeterReading={handleDeleteMeterReading}
          handleDeleteCode={handleDeleteCode}
          handleSaveCalendarTrigger={handleSaveCalendarTrigger}
          handleFinancialsTabHover={handleFinancialsTabHover}
        />
      </div>

    </div>;
};

export default EditAsset;
