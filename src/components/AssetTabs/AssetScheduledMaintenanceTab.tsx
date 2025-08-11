import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { ApiTable } from "@/components/ApiTable";
import { PMTriggerContainer } from "@/components/PMTriggerContainer";
import PMChecklistTabs from "@/components/PMChecklistTabs";
import { AutoSelectDropdown } from "@/components/forms";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiCall } from "@/utils/apis";
import { toast } from "@/hooks/use-toast";

export interface AssetScheduledMaintenanceTabProps {
  assetId: string;
}

const AssetScheduledMaintenanceTab: React.FC<
  AssetScheduledMaintenanceTabProps
> = ({ assetId }) => {
  const queryClient = useQueryClient();
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
    is_active: true,
  });

  const { data: pmSettingsData } = useQuery({
    queryKey: [`/pm-automation/pm-settings?asset=${assetId}`],
    queryFn: async () => {
      const response = await apiCall(
        `/pm-automation/pm-settings?asset=${assetId}`
      );
      return response.data.data || response.data;
    },
  });

  return (
    <div
      className="tab-content-maintenance h-full overflow-y-auto scroll-smooth"
      style={{ scrollSnapType: "y mandatory" }}
    >
      {/* Row 1: Meter Reading Trigger + Calendar Trigger + Log View */}
      <div
        className="grid grid-cols-4 gap-2 h-full animate-fade-in mb-8"
        style={{ scrollSnapAlign: "start" }}
      >
        <div className="col-span-1 min-w-0">
          <div className="px-2 pt-2 pb-0 h-full relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-col">
            <div className="flex items-center justify-center gap-4 mb-2 py-1 bg-accent/20 border border-accent/30 rounded-md">
              <h5 className="text-xs font-medium text-primary dark:text-secondary">
                Meter Reading Trigger
              </h5>
            </div>
            <div className="mb-4">
              <div className="w-full">
                <table className="w-full caption-bottom text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="h-4 px-1 py-0.5 text-left align-middle font-medium text-primary-foreground bg-primary text-xs w-6"></th>
                      <th className="h-4 px-1 py-0.5 text-left align-middle font-medium text-primary-foreground bg-primary text-xs">
                        Name
                      </th>
                      <th className="h-4 px-1 py-0.5 text-left align-middle font-medium text-primary-foreground bg-primary text-xs">
                        Next Trigger
                      </th>
                      <th className="h-4 px-1 py-0.5 text-left align-middle font-medium text-primary-foreground bg-primary text-xs">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const meterTriggerData =
                        pmSettingsData?.filter(
                          (item) => item.trigger_type === "METER"
                        ) || [];
                      const rows = [];
                      for (let i = 0; i < 3; i++) {
                        const item = meterTriggerData[i];
                        rows.push(
                          <tr
                            key={i}
                            className="border-b cursor-pointer hover:bg-muted/50"
                            onClick={() => {
                              setSelectedRadioId(item?.id || i.toString());
                              if (item) {
                                setMeterTriggerData({
                                  name: item.name ?? "",
                                  interval_value: String(
                                    item.interval_value ?? ""
                                  ),
                                  interval_unit: item.interval_unit ?? "hours",
                                  start_threshold_value: String(
                                    item.start_threshold_value ?? ""
                                  ),
                                  lead_time_value: String(
                                    item.lead_time_value ?? ""
                                  ),
                                  next_iteration: "", // Clear to allow auto-selection
                                  is_active:
                                    item.is_active !== undefined
                                      ? item.is_active
                                      : true,
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
                                  is_active: true,
                                });
                                setIsEditMode(false);
                                setSelectedItemId(null);
                                setIsFieldsEditable(true);
                              }
                            }}
                          >
                            <td className="px-1 py-0.5 text-left align-middle text-xs">
                              <input
                                type="radio"
                                name="pm-selection"
                                value={item?.id || i}
                                checked={
                                  selectedRadioId === (item?.id || i.toString())
                                }
                                onChange={() => {}} // Row click handler manages the selection
                                className="w-2.5 h-2.5 pointer-events-none appearance-none border border-muted-foreground/30 bg-background rounded-sm checked:bg-primary checked:border-primary transition-all duration-200 relative checked:after:content-['✓'] checked:after:absolute checked:after:inset-0 checked:after:text-primary-foreground checked:after:text-[8px] checked:after:font-bold checked:after:flex checked:after:items-center checked:after:justify-center checked:after:leading-none"
                              />
                            </td>
                            <td className="px-1 py-0.5 text-left align-middle text-xs">
                              {item?.name || "-"}
                            </td>
                            <td className="px-1 py-0.5 text-left align-middle text-xs">
                              {item?.next_trigger_value || "-"}
                            </td>
                            <td className="px-1 py-0.5 text-left align-middle text-xs">
                              {item?.is_active
                                ? "Active"
                                : item?.is_active === false
                                ? "Inactive"
                                : "-"}
                            </td>
                          </tr>
                        );
                      }
                      return rows;
                    })()}
                  </tbody>
                </table>
              </div>
              <div className="px-2 pb-2 flex flex-col gap-2 mt-7">
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-secondary py-1 px-3 text-sm w-full"
                  disabled={!selectedItemId}
                  onClick={async () => {
                    if (!selectedItemId) return;
                    try {
                      await apiCall(
                        `/pm-automation/pm-settings/manual-generation/${selectedItemId}`,
                        {
                          method: "POST",
                        }
                      );
                      toast({
                        title: "Success",
                        description: "Work order generated successfully!",
                      });
                    } catch (error) {
                      const errorMessage =
                        (error as Error).message ||
                        "Failed to generate work order";
                      toast({
                        title: "Error",
                        description: errorMessage,
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  Generate WO Now
                </Button>

                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground text-center">
                    Next Iteration
                  </span>
                  {selectedItemId ? (
                    <div className="next-iteration-dropdown">
                      <AutoSelectDropdown
                        name="next_iteration"
                        value={meterTriggerData.next_iteration}
                        onChange={(value) => {
                          setMeterTriggerData((prev) => ({
                            ...prev,
                            next_iteration: value,
                          }));
                        }}
                        endpoint={`/pm-automation/pm-settings/manual-generation/${selectedItemId}`}
                        queryKey={[
                          `/pm-automation/pm-settings/manual-generation/${selectedItemId}`,
                        ]}
                        optionValueKey="id"
                        optionLabelKey="name"
                        placeholder="Select iteration"
                        disabled={!isFieldsEditable}
                        className="w-full [&>button]:h-7 [&>button]:text-xs [&>button]:px-2 [&>button]:py-0 [&>button]:min-h-0 [&>button]:border-input [&>button]:bg-background [&>button]:hover:bg-accent [&>button]:focus:bg-accent [&>button]:rounded-sm [&>button]:shadow-sm [&>button]:transition-colors [&>button]:duration-150"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-7 px-2 text-xs border border-input rounded-sm flex items-center text-muted-foreground bg-muted/50 shadow-sm">
                      No PM setting selected
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex-grow overflow-auto flex flex-col justify-end pb-4">
              <div className="space-y-0.5 border-2 border-dashed border-muted-foreground/30 rounded-md p-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-16">
                    Name
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                  <input
                    type="text"
                    value={meterTriggerData.name}
                    onChange={(e) =>
                      setMeterTriggerData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    disabled={!isFieldsEditable}
                    required
                    className={`flex-1 h-6 px-2 text-xs border rounded ${
                      !isFieldsEditable
                        ? "bg-muted/50 text-muted-foreground cursor-not-allowed"
                        : "bg-background"
                    } ${!meterTriggerData.name ? "border-red-300" : ""}`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-16">
                    Every
                  </span>
                  <input
                    type="number"
                    value={meterTriggerData.interval_value}
                    onChange={(e) =>
                      setMeterTriggerData((prev) => ({
                        ...prev,
                        interval_value: e.target.value,
                      }))
                    }
                    disabled={!isFieldsEditable}
                    className={`w-16 h-6 px-2 text-xs border rounded ${
                      !isFieldsEditable
                        ? "bg-muted/50 text-muted-foreground cursor-not-allowed"
                        : "bg-background"
                    }`}
                  />
                  <select
                    value={meterTriggerData.interval_unit}
                    onChange={(e) =>
                      setMeterTriggerData((prev) => ({
                        ...prev,
                        interval_unit: e.target.value,
                      }))
                    }
                    disabled={!isFieldsEditable}
                    className={`h-6 px-2 text-xs border rounded w-20 ${
                      !isFieldsEditable
                        ? "bg-muted/50 text-muted-foreground cursor-not-allowed"
                        : "bg-background"
                    }`}
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
                  <span className="text-xs text-muted-foreground w-16">
                    Starting at
                  </span>
                  <input
                    type="number"
                    value={meterTriggerData.start_threshold_value}
                    onChange={(e) =>
                      setMeterTriggerData((prev) => ({
                        ...prev,
                        start_threshold_value: e.target.value,
                      }))
                    }
                    disabled={!isFieldsEditable}
                    className={`w-40 h-6 px-2 text-xs border rounded ${
                      !isFieldsEditable
                        ? "bg-muted/50 text-muted-foreground cursor-not-allowed"
                        : "bg-background"
                    }`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-16">
                    Create
                  </span>
                  <input
                    type="number"
                    value={meterTriggerData.lead_time_value}
                    onChange={(e) =>
                      setMeterTriggerData((prev) => ({
                        ...prev,
                        lead_time_value: e.target.value,
                      }))
                    }
                    disabled={!isFieldsEditable}
                    className={`w-16 h-6 px-2 text-xs border rounded ${
                      !isFieldsEditable
                        ? "bg-muted/50 text-muted-foreground cursor-not-allowed"
                        : "bg-background"
                    }`}
                  />
                  <span className="text-xs text-muted-foreground">
                    before trigger
                  </span>
                </div>
              </div>
              <div>
                <Button
                  className={`w-full h-8 text-xs ${
                    meterTriggerData.is_active
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-gray-500 hover:bg-gray-600 text-white"
                  }`}
                  onClick={() =>
                    isFieldsEditable &&
                    setMeterTriggerData((prev) => ({
                      ...prev,
                      is_active: !prev.is_active,
                    }))
                  }
                  disabled={!isFieldsEditable}
                >
                  {meterTriggerData.is_active ? "✓ Active" : "✗ Inactive"}
                </Button>
              </div>
              <div className="mt-0.5">
                <Button
                  className="w-full h-8 text-xs bg-primary hover:bg-primary/90 text-white"
                  onClick={async () => {
                    if (!isFieldsEditable) {
                      setIsFieldsEditable(true);
                      return;
                    }

                    const submissionData = {
                      name: meterTriggerData.name,
                      interval_value: meterTriggerData.interval_value,
                      interval_unit: meterTriggerData.interval_unit,
                      start_threshold_value:
                        meterTriggerData.start_threshold_value,
                      start_threshold_unit: meterTriggerData.interval_unit,
                      lead_time_value: meterTriggerData.lead_time_value,
                      lead_time_unit: meterTriggerData.interval_unit,
                      next_iteration: meterTriggerData.next_iteration,
                      is_active: meterTriggerData.is_active,
                      asset: assetId,
                    };
                    try {
                      if (isEditMode && selectedItemId) {
                        await apiCall(
                          `/pm-automation/pm-settings/${selectedItemId}`,
                          {
                            method: "PUT",
                            body: submissionData,
                          }
                        );
                        toast({
                          title: "Success",
                          description:
                            "PM Trigger settings updated successfully!",
                        });
                      } else {
                        await apiCall("/pm-automation/pm-settings", {
                          method: "POST",
                          body: submissionData,
                        });
                        toast({
                          title: "Success",
                          description:
                            "PM Trigger settings created successfully!",
                        });
                      }
                      setIsEditMode(false);
                      setSelectedItemId(null);
                      setIsFieldsEditable(false);
                      queryClient.invalidateQueries({
                        queryKey: [
                          `/pm-automation/pm-settings?asset=${assetId}`,
                        ],
                      });
                    } catch (error) {
                      const errorMessage =
                        (error as Error).message ||
                        `Failed to ${
                          isEditMode ? "update" : "create"
                        } PM Trigger settings`;
                      toast({
                        title: "Error",
                        description: errorMessage,
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  {!isFieldsEditable ? "Edit" : isEditMode ? "Save" : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1 min-w-0">
          <PMTriggerContainer
            title="Calendar Trigger"
            endpoint="/pm-automation/pm-settings"
            data={
              pmSettingsData?.filter(
                (item) => item.trigger_type === "CALENDAR"
              ) || []
            }
            tableColumns={[
              { key: "name", label: "Name" },
              {
                key: "next_due_date",
                label: "Next Due Date",
                type: "datetime",
              },
              { key: "is_active", label: "Status" },
            ]}
            formFields={[
              {
                name: "trigger_type",
                type: "hidden",
                label: "Type",
              },
              {
                name: "name",
                type: "text",
                label: "Name",
                width: "flex-1",
                required: true,
              },
              {
                name: "interval_value",
                type: "number",
                label: "Every",
                width: "w-16",
              },
              {
                name: "interval_unit",
                type: "select",
                label: "",
                width: "w-20",
                options: [
                  { value: "days", label: "days" },
                  { value: "weeks", label: "weeks" },
                  { value: "months", label: "months" },
                  { value: "years", label: "years" },
                ],
              },
              {
                name: "start_date",
                type: "datepicker",
                label: "Starting at",
                width: "flex-1",
              },
              {
                name: "calendar_lead_time_days",
                type: "number",
                label: "Create",
                width: "w-16",
                suffix: "days in advance",
              },
            ]}
            assetId={assetId}
            dataKeyMapping={{
              start_date: "start_date",
              calendar_lead_time_days: "calendar_lead_time_days",
            }}
            generateWorkOrderEndpoint="/pm-automation/pm-settings/manual-generation"
            nextIterationEndpoint="/pm-automation/pm-settings/manual-generation"
          />
        </div>

        <div className="col-span-2 min-w-0">
          <div className="p-4 h-full relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-col">
            <div className="flex items-center justify-center gap-4 mb-1 py-1 -mt-2 bg-accent/20 border border-accent/30 rounded-md">
              <h5 className="text-xs font-medium text-primary dark:text-secondary">
                Log
              </h5>
            </div>
            <div className="flex-grow space-y-4 overflow-auto">
              <div>
                <div className="flex-1 overflow-hidden border rounded-md">
                  <ApiTable
                    endpoint="/work-orders/work_order"
                    filters={{
                      asset: assetId,
                      is_pm_generated: true,
                    }}
                    columns={[
                      {
                        key: "code",
                        header: "Code",
                        type: "string",
                      },
                      {
                        key: "description",
                        header: "Description",
                        type: "string",
                      },
                      {
                        key: "status",
                        header: "Status",
                        type: "object",
                        render: (value: unknown): React.ReactNode => {
                          const status = value as Record<string, unknown>;
                          return String(
                            (status?.control as Record<string, unknown>)
                              ?.name ||
                              status?.name ||
                              "-"
                          );
                        },
                      },
                      {
                        key: "completion_meter_reading",
                        header: "Completion MR",
                        type: "string",
                      },
                      {
                        key: "trigger_meter_reading",
                        header: "Trigger MR",
                        type: "string",
                      },
                    ]}
                    queryKey={["auto-generated-work-orders", assetId]}
                    tableId={`auto-generated-work-orders-${assetId}`}
                    editRoutePattern="/workorders/edit/{id}"
                    className="h-full"
                    tableClassName="text-xs"
                    height="h-full"
                    showFilters={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: PM Checklist/Parts - Full Width */}
      <div
        className="h-full animate-fade-in"
        style={{ scrollSnapAlign: "start" }}
      >
        <div className="pt-6 px-6 pb-6 h-full relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-col">
          <div className="flex-1 overflow-hidden">
            <PMChecklistTabs
              assetId={assetId}
              selectedPmId={selectedItemId}
              onNavigateBack={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetScheduledMaintenanceTab;
