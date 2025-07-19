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
        { name: "description", label: "Description", type: "textarea", rows: 1 },
        { name: "spacer", label: "", type: "spacer" },
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
      ]
    },
    {
      fields: [
        { name: "serial_number", label: "Serial #", type: "input", required: true, inputType: "text" },
        { name: "make", label: "Make", type: "input", required: true, inputType: "text" },
        { name: "model", label: "Model", type: "input", required: true, inputType: "text" },
        {
          name: "year",
          label: "Year",
          type: "dropdown",
          required: false,
          options: [
            { id: "2025", name: "2025" },
            { id: "2024", name: "2024" },
            { id: "2023", name: "2023" },
            { id: "2022", name: "2022" },
            { id: "2021", name: "2021" },
            { id: "2020", name: "2020" },
            { id: "2019", name: "2019" },
            { id: "2018", name: "2018" },
            { id: "2017", name: "2017" },
            { id: "2016", name: "2016" },
            { id: "2015", name: "2015" },
            { id: "2014", name: "2014" },
            { id: "2013", name: "2013" },
            { id: "2012", name: "2012" },
            { id: "2011", name: "2011" },
            { id: "2010", name: "2010" },
            { id: "2009", name: "2009" },
            { id: "2008", name: "2008" },
            { id: "2007", name: "2007" },
            { id: "2006", name: "2006" },
            { id: "2005", name: "2005" },
            { id: "2004", name: "2004" },
            { id: "2003", name: "2003" },
            { id: "2002", name: "2002" },
            { id: "2001", name: "2001" },
            { id: "2000", name: "2000" },
            { id: "1999", name: "1999" },
            { id: "1998", name: "1998" },
            { id: "1997", name: "1997" },
            { id: "1996", name: "1996" },
            { id: "1995", name: "1995" },
            { id: "1994", name: "1994" },
            { id: "1993", name: "1993" },
            { id: "1992", name: "1992" },
            { id: "1991", name: "1991" },
            { id: "1990", name: "1990" },
            { id: "1989", name: "1989" },
            { id: "1988", name: "1988" },
            { id: "1987", name: "1987" },
            { id: "1986", name: "1986" },
            { id: "1985", name: "1985" },
            { id: "1984", name: "1984" },
            { id: "1983", name: "1983" },
            { id: "1982", name: "1982" },
            { id: "1981", name: "1981" },
            { id: "1980", name: "1980" }
          ],
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
