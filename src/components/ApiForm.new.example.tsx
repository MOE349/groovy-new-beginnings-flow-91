/**
 * ApiForm New Features Examples
 * Demonstrates the enhanced capabilities of the refactored ApiForm
 */

import React from "react";
import { z } from "zod";
import {
  ApiForm,
  generateSchema,
  type FieldConfig,
} from "@/components/ApiForm";
import { toast } from "@/hooks/use-toast";

// Example 1: Form with Zod Validation
export const ValidatedFormExample = () => {
  // Define schema with custom validation
  const schema = z
    .object({
      email: z.string().email("Please enter a valid email"),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
      confirmPassword: z.string(),
      age: z.coerce.number().min(18, "Must be at least 18 years old"),
      website: z.string().url("Please enter a valid URL").optional(),
      bio: z.string().max(500, "Bio must be less than 500 characters"),
      terms: z
        .boolean()
        .refine((val) => val === true, "You must accept the terms"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });

  const fields: FieldConfig[] = [
    {
      name: "email",
      type: "input",
      inputType: "email",
      label: "Email",
      required: true,
    },
    {
      name: "password",
      type: "input",
      inputType: "password",
      label: "Password",
      required: true,
    },
    {
      name: "confirmPassword",
      type: "input",
      inputType: "password",
      label: "Confirm Password",
      required: true,
    },
    {
      name: "age",
      type: "input",
      inputType: "number",
      label: "Age",
      required: true,
    },
    {
      name: "website",
      type: "input",
      inputType: "url",
      label: "Website",
      placeholder: "https://example.com",
    },
    { name: "bio", type: "textarea", label: "Bio", rows: 4, maxLength: 500 },
    {
      name: "terms",
      type: "switch",
      label: "I accept the terms and conditions",
      required: true,
    },
  ];

  const handleSubmit = async (data: z.infer<typeof schema>) => {
    toast({
      title: "Form Valid!",
      description: `Welcome ${data.email}!`,
    });
  };

  return (
    <ApiForm
      fields={fields}
      schema={schema}
      title="User Registration with Validation"
      onSubmit={handleSubmit}
      submitText="Register"
    />
  );
};

// Example 2: Multi-Column Layout with Dirty Field Tracking
export const MultiColumnFormExample = () => {
  const fields: FieldConfig[] = [
    { name: "firstName", type: "input", label: "First Name", required: true },
    { name: "lastName", type: "input", label: "Last Name", required: true },
    {
      name: "email",
      type: "input",
      inputType: "email",
      label: "Email",
      required: true,
    },
    { name: "phone", type: "input", inputType: "tel", label: "Phone" },
    { name: "company", type: "input", label: "Company" },
    {
      name: "department",
      type: "dropdown",
      label: "Department",
      options: [
        { value: "engineering", label: "Engineering" },
        { value: "sales", label: "Sales" },
        { value: "marketing", label: "Marketing" },
        { value: "hr", label: "Human Resources" },
      ],
    },
    {
      name: "startDate",
      type: "datepicker",
      label: "Start Date",
      required: true,
    },
    { name: "isRemote", type: "switch", label: "Remote Position" },
  ];

  const handleSubmit = async (
    data: any,
    dirtyFields?: Partial<Record<string, boolean>>
  ) => {
    console.log("Submitted data:", data);
    console.log("Changed fields:", Object.keys(dirtyFields || {}));

    toast({
      title: "Changes Saved",
      description: `Updated ${Object.keys(dirtyFields || {}).length} fields`,
    });
  };

  return (
    <ApiForm
      fields={fields}
      title="Employee Information"
      columns={2}
      showDirtyOnly={true}
      onSubmit={handleSubmit}
      submitText="Save Changes"
      defaultValues={{
        isRemote: false,
        department: "engineering",
      }}
    />
  );
};

// Example 3: Dynamic Form with API Integration
export const DynamicApiFormExample = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string>();

  const fields: FieldConfig[] = [
    {
      name: "project",
      type: "dropdown",
      label: "Project",
      required: true,
      endpoint: "/projects",
      queryKey: ["projects"],
      optionValueKey: "id",
      optionLabelKey: "name",
    },
    {
      name: "assignee",
      type: "dropdown",
      label: "Assignee",
      required: true,
      endpoint: "/users",
      queryKey: ["users"],
      optionValueKey: "id",
      optionLabelKey: "full_name",
      searchable: true,
    },
    { name: "title", type: "input", label: "Task Title", required: true },
    { name: "description", type: "textarea", label: "Description", rows: 5 },
    {
      name: "priority",
      type: "dropdown",
      label: "Priority",
      options: [
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
        { value: "critical", label: "Critical" },
      ],
    },
    {
      name: "dueDate",
      type: "datepicker",
      label: "Due Date",
      minDate: new Date(),
    },
    {
      name: "tags",
      type: "input",
      label: "Tags",
      placeholder: "Comma-separated tags",
    },
  ];

  const handleSubmit = async (data: any) => {
    setLoading(true);
    setError(undefined);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Task Created",
        description: `Task "${data.title}" has been created successfully.`,
      });
    } catch (err: any) {
      setError(err.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ApiForm
      fields={fields}
      title="Create New Task"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      submitText="Create Task"
    />
  );
};

// Example 4: Custom Render with Form Utilities
export const CustomRenderExample = () => {
  const fields: FieldConfig[] = [
    { name: "name", type: "input", label: "Product Name", required: true },
    {
      name: "price",
      type: "input",
      inputType: "number",
      label: "Price",
      required: true,
      min: 0,
      step: 0.01,
    },
    {
      name: "quantity",
      type: "input",
      inputType: "number",
      label: "Quantity",
      required: true,
      min: 1,
    },
    { name: "description", type: "textarea", label: "Description" },
    {
      name: "isActive",
      type: "switch",
      label: "Active",
      description: "Make this product available for purchase",
    },
  ];

  const schema = z.object({
    name: z.string().min(1, "Product name is required"),
    price: z.coerce.number().min(0, "Price must be positive"),
    quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
    description: z.string().optional(),
    isActive: z.boolean(),
  });

  return (
    <ApiForm
      fields={fields}
      schema={schema}
      defaultValues={{ isActive: true, quantity: 1 }}
      customRender={({ form, renderField, isSubmitting }) => {
        const price = form.watch("price") || 0;
        const quantity = form.watch("quantity") || 0;
        const total = price * quantity;

        return (
          <form onSubmit={form.handleSubmit(console.log)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {renderField(fields[0])} {/* name */}
              {renderField(fields[4])} {/* isActive */}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {renderField(fields[1])} {/* price */}
              {renderField(fields[2])} {/* quantity */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Total</label>
                <div className="text-2xl font-bold text-primary">
                  ${total.toFixed(2)}
                </div>
              </div>
            </div>
            {renderField(fields[3])} {/* description */}
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => form.reset()}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Reset Form
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Product"}
              </button>
            </div>
          </form>
        );
      }}
    />
  );
};

// Usage in a page
const ApiFormExamples = () => {
  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold">ApiForm New Features</h1>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Validation Example</h2>
        <ValidatedFormExample />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          Multi-Column with Dirty Tracking
        </h2>
        <MultiColumnFormExample />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Dynamic API Integration</h2>
        <DynamicApiFormExample />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Custom Render</h2>
        <CustomRenderExample />
      </section>
    </div>
  );
};

export default ApiFormExamples;
