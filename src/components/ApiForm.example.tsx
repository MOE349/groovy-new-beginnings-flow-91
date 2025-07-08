import ApiForm, { FormField } from "@/components/ApiForm";

// Example 1: Basic form with all field types
export const BasicApiForm = () => {
  const fields: FormField[] = [
    {
      name: "name",
      type: "input",
      label: "Full Name",
      placeholder: "Enter your full name",
      required: true,
    },
    {
      name: "email",
      type: "input",
      label: "Email",
      placeholder: "Enter your email",
      inputType: "email",
      required: true,
    },
    {
      name: "bio",
      type: "textarea",
      label: "Bio",
      placeholder: "Tell us about yourself",
      rows: 3,
    },
    {
      name: "birthDate",
      type: "datepicker",
      label: "Birth Date",
      placeholder: "Select your birth date",
    },
    {
      name: "category",
      type: "dropdown",
      label: "Category",
      placeholder: "Select a category",
      options: [
        { value: "personal", label: "Personal" },
        { value: "business", label: "Business" },
        { value: "other", label: "Other" },
      ],
    },
    {
      name: "notifications",
      type: "switch",
      label: "Enable Notifications",
      description: "Receive email notifications about updates",
    },
  ];

  const handleSubmit = (data: Record<string, any>) => {
    console.log("Form submitted:", data);
  };

  return (
    <ApiForm
      fields={fields}
      title="User Profile Form"
      onSubmit={handleSubmit}
      submitText="Save Profile"
    />
  );
};

// Example 2: Dynamic dropdown with API data
export const ApiDrivenForm = () => {
  const fields: FormField[] = [
    {
      name: "title",
      type: "input",
      label: "Asset Title",
      required: true,
    },
    {
      name: "category",
      type: "dropdown",
      label: "Category",
      placeholder: "Select category",
      endpoint: "/categories",
      optionValueKey: "id",
      optionLabelKey: "name",
      queryKey: ["categories"],
    },
    {
      name: "location",
      type: "dropdown",
      label: "Location",
      placeholder: "Select location",
      endpoint: "/locations",
      optionValueKey: "id",
      optionLabelKey: "name",
      queryKey: ["locations"],
    },
    {
      name: "description",
      type: "textarea",
      label: "Description",
      rows: 4,
    },
    {
      name: "purchaseDate",
      type: "datepicker",
      label: "Purchase Date",
      required: true,
    },
    {
      name: "isActive",
      type: "switch",
      label: "Active Status",
      description: "Mark this asset as active",
    },
  ];

  const handleSubmit = (data: Record<string, any>) => {
    console.log("Asset form submitted:", data);
  };

  return (
    <ApiForm
      fields={fields}
      title="Asset Management"
      onSubmit={handleSubmit}
      submitText="Create Asset"
    />
  );
};

// Example 3: Simple form without card wrapper
export const SimpleForm = () => {
  const fields: FormField[] = [
    {
      name: "search",
      type: "input",
      label: "Search Query",
      placeholder: "Enter search terms",
    },
    {
      name: "includeArchived",
      type: "switch",
      label: "Include Archived",
      description: "Search in archived items too",
    },
  ];

  const handleSubmit = (data: Record<string, any>) => {
    console.log("Search:", data);
  };

  return (
    <ApiForm
      fields={fields}
      onSubmit={handleSubmit}
      submitText="Search"
    />
  );
};