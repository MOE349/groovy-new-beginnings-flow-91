import { FormField } from "@/components/ApiForm";
import {
  nameField,
  createDropdownField,
  createTextField,
} from "./common.fields";

/**
 * Settings Page Form Definitions
 * Centralized form field configurations for all settings-related forms
 */

export const workOrderStatusFormFields: FormField[] = [
  createDropdownField(
    "control",
    "Control",
    "/work-orders/controls",
    ["work_orders_controls"],
    true
  ),
  nameField,
];

export const weightClassFormFields: FormField[] = [
  nameField,
  createTextField("weight", "Weight", true),
];

export const projectFormFields: FormField[] = [nameField];

export const accountCodeFormFields: FormField[] = [nameField];

export const jobCodeFormFields: FormField[] = [nameField];

export const assetStatusFormFields: FormField[] = [nameField];
