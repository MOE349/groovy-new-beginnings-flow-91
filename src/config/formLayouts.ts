import { FormLayoutConfig } from "@/components/FormLayout";

// Asset form configurations
export const equipmentFormConfig: FormLayoutConfig = {
  title: "Equipment Information",
  backRoute: "/asset",
  showImage: true,
  showOnlineToggle: true,
  showSpecialSections: {
    location: true,
  },
  columns: [
    {
      fields: [
        { name: "code", label: "Code", type: "input", required: true, inputType: "text" },
        { name: "name", label: "Name", type: "input", required: true, inputType: "text" },
        { name: "description", label: "Description", type: "textarea", rows: 2 },
      ]
    },
    {
      fields: [
        { 
          name: "category", 
          label: "Category", 
          type: "dropdown", 
          required: true, 
          endpoint: "/assets/equipment_category",
          queryKey: ["equipment_category"],
          optionValueKey: "id", 
          optionLabelKey: "name"
        },
        { name: "make", label: "Make", type: "input", required: true, inputType: "text" },
        { name: "model", label: "Model", type: "input", required: true, inputType: "text" },
        { name: "serial_number", label: "Serial #", type: "input", required: true, inputType: "text" },
        {
          name: "year",
          label: "Year",
          type: "dropdown",
          required: false,
          options: Array.from({ length: 46 }, (_, i) => {
            const year = new Date().getFullYear() - i;
            return { id: year.toString(), name: year.toString() };
          }),
        },
        {
          name: "weight_class",
          label: "Weight Class",
          type: "dropdown",
          required: false,
          endpoint: "/assets/equipment_weight_class",
          queryKey: ["equipment_weight_class"],
          optionValueKey: "id",
          optionLabelKey: "name",
        },
      ]
    },
    {
      fields: [
        { 
          name: "status", 
          label: "Asset Status", 
          type: "dropdown",
          required: true,
          options: [
            { id: "active", name: "Active" },
            { id: "inactive", name: "Inactive" },
            { id: "maintenance", name: "Under Maintenance" },
            { id: "retired", name: "Retired" }
          ]
        },
        { 
          name: "job_code", 
          label: "Job Code", 
          type: "dropdown",
          options: [
            { id: "job001", name: "JOB-001" },
            { id: "job002", name: "JOB-002" },
            { id: "job003", name: "JOB-003" },
            { id: "job004", name: "JOB-004" }
          ]
        },
        { 
          name: "account_code", 
          label: "Account Code", 
          type: "dropdown",
          options: [
            { id: "acc001", name: "ACC-001" },
            { id: "acc002", name: "ACC-002" },
            { id: "acc003", name: "ACC-003" },
            { id: "acc004", name: "ACC-004" }
          ]
        },
        { 
          name: "project", 
          label: "Project", 
          type: "dropdown",
          options: [
            { id: "proj001", name: "Project Alpha" },
            { id: "proj002", name: "Project Beta" },
            { id: "proj003", name: "Project Gamma" },
            { id: "proj004", name: "Project Delta" }
          ]
        },
      ]
    }
  ]
};

export const attachmentFormConfig: FormLayoutConfig = {
  title: "Attachment Information",
  backRoute: "/asset",
  showImage: true,
  showOnlineToggle: true,
  showSpecialSections: {
    location: true,
  },
  columns: [
    {
      fields: [
        { name: "code", label: "Code", type: "input", required: true, inputType: "text" },
        { name: "name", label: "Name", type: "input", required: true, inputType: "text" },
        { name: "description", label: "Description", type: "textarea", rows: 1 },
        { 
          name: "equipment", 
          label: "Equipment", 
          type: "dropdown", 
          endpoint: "/assets/assets",
          queryKey: ["assets_assets"],
          optionValueKey: "id", 
          optionLabelKey: "name"
        },
      ]
    },
    {
      fields: [
        { 
          name: "category", 
          label: "Category", 
          type: "dropdown", 
          required: true, 
          endpoint: "/assets/attachment_category",
          queryKey: ["attachment_category"],
          optionValueKey: "id", 
          optionLabelKey: "name"
        },
        { name: "make", label: "Make", type: "input", required: true, inputType: "text" },
        { name: "model", label: "Model", type: "input", required: true, inputType: "text" },
        { name: "serial_number", label: "Serial #", type: "input", required: true, inputType: "text" },
      ]
    },
    {
      fields: [
        { 
          name: "status", 
          label: "Asset Status", 
          type: "dropdown",
          required: true,
          options: [
            { id: "active", name: "Active" },
            { id: "inactive", name: "Inactive" },
            { id: "maintenance", name: "Under Maintenance" },
            { id: "retired", name: "Retired" }
          ]
        },
        { 
          name: "job_code", 
          label: "Job Code", 
          type: "dropdown",
          options: [
            { id: "job001", name: "JOB-001" },
            { id: "job002", name: "JOB-002" },
            { id: "job003", name: "JOB-003" },
            { id: "job004", name: "JOB-004" }
          ]
        },
        { 
          name: "account_code", 
          label: "Account Code", 
          type: "dropdown",
          options: [
            { id: "acc001", name: "ACC-001" },
            { id: "acc002", name: "ACC-002" },
            { id: "acc003", name: "ACC-003" },
            { id: "acc004", name: "ACC-004" }
          ]
        },
        { 
          name: "project", 
          label: "Project", 
          type: "dropdown",
          options: [
            { id: "proj001", name: "Project Alpha" },
            { id: "proj002", name: "Project Beta" },
            { id: "proj003", name: "Project Gamma" },
            { id: "proj004", name: "Project Delta" }
          ]
        },
      ]
    }
  ]
};

// Work order form configuration
export const workOrderFormConfig: FormLayoutConfig = {
  title: "Work Order Information",
  backRoute: "/workorders",
  showImage: true,
  showOnlineToggle: true,
  showSpecialSections: {
    location: true,
  },
  columns: [
    {
      fields: [
        { 
          name: "asset", 
          label: "Asset", 
          type: "dropdown", 
          required: true, 
          endpoint: "/assets/assets",
          queryKey: ["assets_assets"],
          optionValueKey: "id",
          optionLabelKey: "name"
        },
        { 
          name: "status", 
          label: "Status", 
          type: "dropdown", 
          required: true, 
          endpoint: "/work-orders/status",
          queryKey: ["work_orders_status"],
          optionValueKey: "id",
          optionLabelKey: "name"
        },
        { name: "description", label: "Description", type: "textarea", required: false, rows: 3 },
      ]
    },
    {
      fields: [
        { name: "maint_type", label: "Maint Type", type: "input", required: false, inputType: "text" },
        { name: "priority", label: "Priority", type: "input", required: false, inputType: "text" },
        { name: "suggested_start_date", label: "Suggested Start Date", type: "datepicker", required: false },
        { name: "completion_end_date", label: "Completion Date", type: "datepicker", required: false },
      ]
    }
  ]
};