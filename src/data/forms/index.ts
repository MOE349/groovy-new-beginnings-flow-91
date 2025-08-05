/**
 * Central Form Registry
 * Single source of truth for all form definitions across the application
 */

// Settings forms
export {
  workOrderStatusFormFields,
  weightClassFormFields,
  projectFormFields,
  accountCodeFormFields,
  jobCodeFormFields,
  assetStatusFormFields,
} from "./settings.forms";

// Asset forms (re-export for convenience)
export { equipmentFields, attachmentFields } from "../assetFormFields";

// Work order forms
export { workOrderFields } from "../workOrderFormFields";

// Site & Location forms
export { siteFormFields, locationFormFields } from "../siteFormFields";

// Category forms
export {
  equipmentCategoryFormFields,
  attachmentCategoryFormFields,
} from "../categoryFormFields";

/**
 * Form Registry Map
 * Provides programmatic access to form definitions by key
 */
export const FORMS = {
  // Settings forms
  workOrderStatus: () =>
    import("./settings.forms").then((m) => m.workOrderStatusFormFields),
  weightClass: () =>
    import("./settings.forms").then((m) => m.weightClassFormFields),
  project: () => import("./settings.forms").then((m) => m.projectFormFields),
  accountCode: () =>
    import("./settings.forms").then((m) => m.accountCodeFormFields),
  jobCode: () => import("./settings.forms").then((m) => m.jobCodeFormFields),
  assetStatus: () =>
    import("./settings.forms").then((m) => m.assetStatusFormFields),

  // Asset forms
  equipment: () => import("../assetFormFields").then((m) => m.equipmentFields),
  attachment: () =>
    import("../assetFormFields").then((m) => m.attachmentFields),

  // Work order forms
  workOrder: () =>
    import("../workOrderFormFields").then((m) => m.workOrderFields),

  // Site & Location forms
  site: () => import("../siteFormFields").then((m) => m.siteFormFields),
  location: () => import("../siteFormFields").then((m) => m.locationFormFields),

  // Category forms
  equipmentCategory: () =>
    import("../categoryFormFields").then((m) => m.equipmentCategoryFormFields),
  attachmentCategory: () =>
    import("../categoryFormFields").then((m) => m.attachmentCategoryFormFields),
} as const;

/**
 * Form metadata for UI generation
 */
export const FORM_METADATA = {
  workOrderStatus: {
    title: "Work Order Status",
    endpoint: "/work-orders/status",
    description: "Manage work order status configurations",
  },
  weightClass: {
    title: "Weight Class",
    endpoint: "/assets/weight_class",
    description: "Manage equipment weight classifications",
  },
  project: {
    title: "Project",
    endpoint: "/company/projects",
    description: "Manage company projects",
  },
  accountCode: {
    title: "Account Code",
    endpoint: "/company/account_codes",
    description: "Manage accounting codes",
  },
  jobCode: {
    title: "Job Code",
    endpoint: "/company/job_codes",
    description: "Manage job classifications",
  },
  assetStatus: {
    title: "Asset Status",
    endpoint: "/assets/asset_status",
    description: "Manage asset status configurations",
  },
} as const;

export type FormKey = keyof typeof FORMS;
export type FormMetadataKey = keyof typeof FORM_METADATA;
