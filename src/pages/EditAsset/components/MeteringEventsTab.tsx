/**
 * MeteringEventsTab Component
 * Handles meter readings and fault codes
 */

import React from "react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiTable } from "@/components/ApiTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ApiForm from "@/components/ApiForm";
import { apiCall } from "@/utils/apis";
import { handleApiError } from "@/utils/errorHandling";

interface MeteringEventsTabProps {
  assetId: string;
}

export const MeteringEventsTab = React.memo<MeteringEventsTabProps>(({ assetId }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleDeleteMeterReading = React.useCallback(async (readingId: string) => {
    try {
      await apiCall(`/meter-readings/meter_reading/${readingId}`, {
        method: "DELETE",
      });
      queryClient.invalidateQueries({
        queryKey: [`/meter-readings/meter_reading?asset=${assetId}`],
      });
      queryClient.invalidateQueries({
        queryKey: ["meter_readings", assetId],
      });
      toast({
        title: "Success",
        description: "Meter reading deleted successfully!",
      });
    } catch (error: any) {
      handleApiError(error, "Delete Failed");
    }
  }, [assetId, queryClient]);

  const handleDeleteCode = React.useCallback(async (codeId: string) => {
    try {
      await apiCall(`/fault-codes/codes/${codeId}`, {
        method: "DELETE",
      });
      queryClient.invalidateQueries({
        queryKey: [`/fault-codes/codes?asset=${assetId}`],
      });
      queryClient.invalidateQueries({
        queryKey: ["codes", assetId],
      });
      toast({
        title: "Success",
        description: "Code deleted successfully!",
      });
    } catch (error: any) {
      handleApiError(error, "Delete Failed");
    }
  }, [assetId, queryClient]);

  const meterReadingColumns = React.useMemo(() => [
    {
      key: "meter_reading",
      header: "Meter Reading",
    },
    {
      key: "created_at",
      header: "Creation Date",
      render: (value: any) =>
        value ? new Date(value).toLocaleDateString() : "-",
    },
    {
      key: "created_by",
      header: "Created By",
      render: (value: any) => {
        if (typeof value === "object" && value) {
          return value.name || value.email || value.id || "-";
        }
        return value || "-";
      },
    },
    {
      key: "actions",
      header: "",
      render: (value: any, row: any) => (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            onClick={() => handleDeleteMeterReading(row.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ], [handleDeleteMeterReading]);

  const codeColumns = React.useMemo(() => [
    {
      key: "code",
      header: "Code",
    },
    {
      key: "created_at",
      header: "Creation Date",
      render: (value: any) =>
        value ? new Date(value).toLocaleDateString() : "-",
    },
    {
      key: "created_by",
      header: "Created By",
      render: (value: any) => {
        if (typeof value === "object" && value) {
          return value.name || value.email || value.id || "-";
        }
        return value || "-";
      },
    },
  ], []);

  return (
    <div className="tab-content-metering">
      <div className="tab-content-grid-2">
        <div className="min-w-0">
          <div className="mb-1">
            <Button
              variant="default"
              size="sm"
              className="flex items-center gap-2 px-3 py-1"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="h-3 w-3" />
              Update Reading
            </Button>
          </div>

          <div className="w-full max-w-full">
            <ApiTable
              endpoint={`/meter-readings/meter_reading?asset=${assetId}`}
              columns={meterReadingColumns}
              tableId={`meter-readings-${assetId}`}
            />
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-1">
            <Button
              variant="default"
              size="sm"
              className="flex items-center gap-2 px-3 py-1"
              onClick={() => setIsCodeDialogOpen(true)}
            >
              <Plus className="h-3 w-3" />
              Update Code
            </Button>
          </div>

          <div className="w-full max-w-full">
            <ApiTable
              endpoint={`/fault-codes/codes?asset=${assetId}`}
              columns={codeColumns}
              tableId={`codes-${assetId}`}
            />
          </div>
        </div>
      </div>

      {/* Meter Reading Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Meter Reading</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ApiForm
              fields={[
                {
                  name: "meter_reading",
                  type: "input",
                  inputType: "text",
                  label: "Meter Reading",
                  placeholder: "Enter meter reading",
                  required: true,
                },
              ]}
              onSubmit={async (data) => {
                try {
                  await apiCall("/meter-readings/meter_reading/", {
                    method: "POST",
                    body: { ...data, asset: assetId },
                  });
                  queryClient.invalidateQueries({
                    queryKey: [`/meter-readings/meter_reading?asset=${assetId}`],
                  });
                  setIsDialogOpen(false);
                  toast({
                    title: "Success",
                    description: "Meter reading added successfully!",
                  });
                } catch (error: any) {
                  handleApiError(error, "Add Failed");
                }
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Code Dialog */}
      <Dialog open={isCodeDialogOpen} onOpenChange={setIsCodeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ApiForm
              fields={[
                {
                  name: "code",
                  type: "input",
                  inputType: "text",
                  label: "Code",
                  placeholder: "Enter code",
                  required: true,
                },
              ]}
              onSubmit={async (data) => {
                try {
                  await apiCall("/fault-codes/codes/", {
                    method: "POST",
                    body: { ...data, asset: assetId },
                  });
                  queryClient.invalidateQueries({
                    queryKey: [`/fault-codes/codes?asset=${assetId}`],
                  });
                  setIsCodeDialogOpen(false);
                  toast({
                    title: "Success",
                    description: "Code added successfully!",
                  });
                } catch (error: any) {
                  handleApiError(error, "Add Failed");
                }
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

MeteringEventsTab.displayName = "MeteringEventsTab";