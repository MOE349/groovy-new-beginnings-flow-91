import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DualApiTableTab, TableConfig } from "@/components/EntityTabs";
import { useQueryClient } from "@tanstack/react-query";
import { apiCall } from "@/utils/apis";
import { toast } from "@/hooks/use-toast";
import { handleApiError } from "@/utils/errorHandling";

export interface AssetMeteringEventsTabProps {
  assetId: string;
}

const AssetMeteringEventsTab: React.FC<AssetMeteringEventsTabProps> = ({
  assetId,
}) => {
  const queryClient = useQueryClient();

  const handleDeleteMeterReading = async (row: Record<string, unknown>) => {
    try {
      await apiCall(`/meter-readings/meter_reading/${row.id}`, {
        method: "DELETE",
      });
      queryClient.invalidateQueries({
        queryKey: [`/meter-readings/meter_reading?asset=${assetId}`],
      });
      queryClient.invalidateQueries({
        queryKey: ["meter_readings", row.id],
      });
      toast({
        title: "Success",
        description: "Meter reading deleted successfully!",
      });
    } catch (error) {
      handleApiError(error, "Delete Failed");
    }
  };

  const leftTableConfig: TableConfig = {
    endpoint: `/meter-readings/meter_reading?asset=${assetId}`,
    columns: [
      {
        key: "meter_reading",
        header: "Meter Reading",
      },
      {
        key: "created_at",
        header: "Creation Date",
        render: (value: string | null | undefined) =>
          value ? new Date(value).toLocaleDateString() : "-",
      },
      {
        key: "created_by",
        header: "Created By",
        render: (value: unknown): React.ReactNode => {
          if (typeof value === "object" && value) {
            const user = value as Record<string, unknown>;
            return String(user.name || user.email || user.id || "-");
          }
          return String(value || "-");
        },
      },
    ],
    onDelete: handleDeleteMeterReading,
    tableId: `meter-readings-${assetId}`,
    createButtonText: "Update Reading",
    dialogTitle: "Add Meter Reading",
    formFields: [
      {
        name: "meter_reading",
        type: "input",
        inputType: "text",
        required: true,
        label: "Meter Reading",
      },
    ],
    createEndpoint: "/meter-readings/meter_reading",
    queryKey: [`/meter-readings/meter_reading?asset=${assetId}`],
    successMessage: "Meter reading added successfully!",
  };

  const rightTableConfig: TableConfig = {
    endpoint: `/fault-codes/codes?asset=${assetId}`,
    columns: [
      {
        key: "code",
        header: "Code",
      },
      {
        key: "created_at",
        header: "Creation Date",
        render: (value: string | null | undefined) =>
          value ? new Date(value).toLocaleDateString() : "-",
      },
      {
        key: "created_by",
        header: "Created By",
        render: (value: unknown): React.ReactNode => {
          if (typeof value === "object" && value) {
            const user = value as Record<string, unknown>;
            return String(user.name || user.email || user.id || "-");
          }
          return String(value || "-");
        },
      },
    ],
    tableId: `codes-${assetId}`,
    createButtonText: "Update Code",
    dialogTitle: "Add Code",
    formFields: [
      {
        name: "code",
        type: "input",
        inputType: "text",
        required: true,
        label: "Code",
      },
    ],
    createEndpoint: "/fault-codes/codes",
    queryKey: [`/fault-codes/codes?asset=${assetId}`],
    successMessage: "Code added successfully!",
  };

  return (
    <DualApiTableTab
      assetId={assetId}
      leftTable={leftTableConfig}
      rightTable={rightTableConfig}
      className="tab-content-metering"
    />
  );
};

export default AssetMeteringEventsTab;
