import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiTable } from "@/components/ApiTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ApiForm from "@/components/ApiForm";
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);

  const handleDeleteMeterReading = async (readingId: string) => {
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
    } catch (error) {
      handleApiError(error, "Delete Failed");
    }
  };

  return (
    <div className="tab-content-metering">
      <div className="tab-content-grid-2 gap-3">
        <ApiTable
          createNewText="Update Reading"
          onCreateNew={() => setIsDialogOpen(true)}
          endpoint={`/meter-readings/meter_reading?asset=${assetId}`}
          columns={[
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
            {
              key: "actions",
              header: "",
              render: (value: unknown, row: Record<string, unknown>) => (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteMeterReading(row.id as string)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ),
            },
          ]}
          tableId={`meter-readings-${assetId}`}
        />
        <ApiTable
          createNewText="Update Code"
          onCreateNew={() => setIsCodeDialogOpen(true)}
          endpoint={`/fault-codes/codes?asset=${assetId}`}
          columns={[
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
          ]}
          tableId={`codes-${assetId}`}
        />
      </div>

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
                  required: true,
                  label: "Meter Reading",
                },
              ]}
              onSubmit={async (data) => {
                const submissionData = {
                  ...data,
                  asset: assetId,
                };
                try {
                  await apiCall("/meter-readings/meter_reading", {
                    method: "POST",
                    body: submissionData,
                  });
                  queryClient.invalidateQueries({
                    queryKey: [
                      `/meter-readings/meter_reading?asset=${assetId}`,
                    ],
                  });
                  queryClient.invalidateQueries({
                    queryKey: ["meter_readings", assetId],
                  });
                  setIsDialogOpen(false);
                  toast({
                    title: "Success",
                    description: "Meter reading added successfully!",
                  });
                } catch (error) {
                  handleApiError(error, "Save Failed");
                }
              }}
              customLayout={({ handleSubmit, renderField }) => (
                <div className="space-y-4">
                  {renderField({
                    name: "meter_reading",
                    type: "input",
                    inputType: "text",
                    required: true,
                    label: "Meter Reading",
                  })}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit}>Save</Button>
                  </div>
                </div>
              )}
            />
          </div>
        </DialogContent>
      </Dialog>

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
                  required: true,
                  label: "Code",
                },
              ]}
              onSubmit={async (data) => {
                const submissionData = {
                  ...data,
                  asset: assetId,
                };
                try {
                  await apiCall("/fault-codes/codes", {
                    method: "POST",
                    body: submissionData,
                  });
                  queryClient.invalidateQueries({
                    queryKey: [`/fault-codes/codes?asset=${assetId}`],
                  });
                  queryClient.invalidateQueries({
                    queryKey: ["codes", assetId],
                  });
                  setIsCodeDialogOpen(false);
                  toast({
                    title: "Success",
                    description: "Code added successfully!",
                  });
                } catch (error) {
                  toast({
                    title: "Error",
                    description:
                      (error as Error).message || "Failed to add code",
                    variant: "destructive",
                  });
                }
              }}
              customLayout={({ handleSubmit, renderField }) => (
                <div className="space-y-4">
                  {renderField({
                    name: "code",
                    type: "input",
                    inputType: "text",
                    required: true,
                    label: "Code",
                  })}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCodeDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit}>Save</Button>
                  </div>
                </div>
              )}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssetMeteringEventsTab;
