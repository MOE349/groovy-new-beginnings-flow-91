import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { apiCall } from "@/utils/apis";
import ApiTable, { TableColumn } from "@/components/ApiTable";
import ApiForm, { FormField } from "@/components/ApiForm";

export interface AssetComponentsTabProps {
  assetId: string;
}

const AssetComponentsTab: React.FC<AssetComponentsTabProps> = ({ assetId }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<Record<string, any> | null>(
    null
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Define table columns
  const columns: TableColumn[] = [
    { key: "name", header: "Name", type: "string" },
    {
      key: "work_order",
      header: "Work Order",
      type: "object",
      render: (value) => value?.code || value?.name || value?.id || "-",
    },
    {
      key: "initial_meter_reading",
      header: "Initial Meter Reading",
      type: "number",
      render: (value) => (value != null ? value.toString() : "-"),
    },
    {
      key: "component_meter_reading",
      header: "Component Meter Reading",
      type: "number",
      render: (value) => (value != null ? value.toString() : "-"),
    },
    {
      key: "warranty_meter_reading",
      header: "Warranty Meter Reading",
      type: "number",
      render: (value) => (value != null ? value.toString() : "-"),
    },
    { key: "warranty_exp_date", header: "Warranty Exp Date", type: "date" },
    {
      key: "is_warranty_expired",
      header: "Warranty Expired",
      type: "bool",
      render: (value) => (value ? "Yes" : "No"),
    },
  ];

  // Define form fields
  const formFields: FormField[] = [
    { name: "name", label: "Name", type: "input", required: true },
    {
      name: "work_order",
      label: "Work Order",
      type: "dropdown",
      endpoint: `/work-orders/work_order?asset=${assetId}&is_closed=false`,
      queryKey: ["work_orders", "by_asset", assetId],
      optionValueKey: "id",
      optionLabelKey: "code",
    },
    {
      name: "initial_meter_reading",
      label: "Initial Meter Reading",
      type: "input",
      inputType: "number",
    },
    {
      name: "component_meter_reading",
      label: "Component Meter Reading",
      type: "input",
      inputType: "number",
      disabled: true,
    },
    {
      name: "warranty_meter_reading",
      label: "Warranty Meter Reading",
      type: "input",
      inputType: "number",
    },
    {
      name: "warranty_exp_date",
      label: "Warranty Exp Date",
      type: "datepicker",
    },
    {
      name: "files",
      label: "Files",
      type: "file_manager",
      linkToModel: "components.component",
      linkToId: editingItem?.id,
    },
  ];

  // Handle form submission
  const handleSubmit = async (data: Record<string, any>) => {
    try {
      setLoading(true);

      // Add asset ID to the data
      const submissionData = {
        ...data,
        asset: assetId,
      };

      if (editingItem) {
        await apiCall(`/components/component/${editingItem.id}`, {
          method: "PATCH",
          body: submissionData,
        });
        toast({
          title: "Success",
          description: "Component updated successfully",
        });
      } else {
        await apiCall("/components/component/", {
          method: "POST",
          body: submissionData,
        });
        toast({
          title: "Success",
          description: "Component created successfully",
        });
      }

      await queryClient.invalidateQueries({
        queryKey: ["components", assetId],
      });

      setDialogOpen(false);
      setEditingItem(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message ||
          `Failed to ${editingItem ? "update" : "create"} component`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle row click for editing
  const handleRowClick = (row: Record<string, any>) => {
    setEditingItem(row);
    setDialogOpen(true);
  };

  // Handle create new
  const handleCreateNew = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  return (
    <div className="tab-content-generic">
      <div className="p-4 h-full flex flex-col">
        <ApiTable
          title="Components"
          endpoint="/components/component/"
          filters={{ asset: assetId }}
          columns={columns}
          queryKey={["components", assetId]}
          onCreateNew={handleCreateNew}
          onRowClick={handleRowClick}
          createNewText="New Component"
          emptyMessage="No components found"
          className="flex-1"
          height="100%"
        />

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Component" : "Create Component"}
              </DialogTitle>
            </DialogHeader>
            <ApiForm
              fields={formFields}
              onSubmit={handleSubmit}
              submitText={editingItem ? "Update Component" : "Create Component"}
              initialData={editingItem || {}}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AssetComponentsTab;
