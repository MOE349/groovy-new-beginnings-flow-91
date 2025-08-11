import React, { useState } from "react";
import { ChevronLeft, Plus, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { apiCall } from "@/utils/apis";
import ApiTable from "./ApiTable";
import ApiForm from "./ApiForm";
import PMSettingsSelector from "./PMSettingsSelector";

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

const PMChecklistTabs: React.FC<PMChecklistTabsProps> = ({
  assetId,
  selectedPmId,
  onNavigateBack,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tabs, setTabs] = useState<TabItem[]>([
    { id: "500-hour", name: "500 HOUR", isDefault: true },
    { id: "1000-hour", name: "1000 HOUR", isDefault: true },
    { id: "2000-hour", name: "2000 HOUR", isDefault: true },
  ]);
  const [activeTab, setActiveTab] = useState("pm-settings");
  const [newTabName, setNewTabName] = useState("");
  const [isAddingTab, setIsAddingTab] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmitChecklistItem = async (data: Record<string, unknown>) => {
    try {
      console.log("Submitting checklist item:", data);
      console.log("Selected PM ID:", selectedPmId);

      // Ensure pm_settings is included in the payload
      const submitData = {
        ...data,
        pm_settings: selectedPmId,
      };

      console.log("Final submit data:", submitData);

      await apiCall("/pm-automation/pm-settings-checklist", {
        method: "POST",
        body: JSON.stringify(submitData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      toast({
        title: "Success",
        description: "Checklist item added successfully",
      });

      // Refresh the table data
      queryClient.invalidateQueries({
        queryKey: [
          "/pm-automation/pm-settings-checklist",
          { pm_settings: selectedPmId },
        ],
      });

      // Close the dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error submitting checklist item:", error);
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
        isDefault: false,
      };
      setTabs([...tabs, newTab]);
      setActiveTab(newTab.id);
      setNewTabName("");
      setIsAddingTab(false);
    }
  };

  const handleRemoveTab = (tabId: string) => {
    const tabToRemove = tabs.find((tab) => tab.id === tabId);
    if (tabToRemove && !tabToRemove.isDefault) {
      const newTabs = tabs.filter((tab) => tab.id !== tabId);
      setTabs(newTabs);
      if (activeTab === tabId) {
        setActiveTab(newTabs[0]?.id || "");
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Navigation Header */}
      <div className="flex items-center justify-center gap-4 mb-4 py-3 bg-accent/20 border border-accent/30 rounded-lg">
        <h4 className="text-lg font-semibold text-primary dark:text-secondary">
          PM Checklist/Parts Management
        </h4>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            <TabsContent
              value="pm-settings"
              className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col"
            >
              <PMSettingsSelector assetId={assetId} />
            </TabsContent>

            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="h-full m-0">
                <div className="h-full p-6 bg-card rounded-lg border">
                  <h3 className="text-xl font-semibold mb-4">
                    {tab.name} Content
                  </h3>
                  <p className="text-muted-foreground">
                    This tab content will be implemented based on your specific
                    requirements.
                  </p>
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
