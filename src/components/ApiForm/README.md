# ApiForm Component

A high-performance, modular form component with React Hook Form and Zod validation.

## Quick Start

### Basic Usage (Backward Compatible)

```typescript
import ApiForm from "@/components/ApiForm";

const fields = [
  { name: "email", type: "input", inputType: "email", required: true },
  { name: "message", type: "textarea", rows: 3 }
];

<ApiForm fields={fields} onSubmit={handleSubmit} />
```

### With Validation

```typescript
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  age: z.number().min(18)
});

<ApiForm
  fields={fields}
  schema={schema}
  onSubmit={(data) => {
    // data is typed!
  }}
/>
```

### Track Only Changed Fields

```typescript
<ApiForm
  fields={fields}
  showDirtyOnly={true}
  onSubmit={(data, dirtyFields) => {
    // Perfect for PATCH requests
  }}
/>
```

## Field Types

### Input Field

```typescript
{
  name: "email",
  type: "input",
  inputType: "email", // text, email, password, number, tel, url
  label: "Email Address",
  placeholder: "user@example.com",
  required: true,
  min: 0,          // for number type
  max: 100,        // for number type
  pattern: "\\d+"  // regex pattern
}
```

### Textarea Field

```typescript
{
  name: "description",
  type: "textarea",
  label: "Description",
  rows: 4,
  maxLength: 500
}
```

### Switch Field

```typescript
{
  name: "isActive",
  type: "switch",
  label: "Active",
  description: "Enable this feature"
}
```

### Date Picker Field

```typescript
{
  name: "startDate",
  type: "datepicker",
  label: "Start Date",
  minDate: new Date(),
  maxDate: new Date(2025, 0, 1)
}
```

### Dropdown Field

```typescript
// Static options
{
  name: "role",
  type: "dropdown",
  label: "Role",
  options: [
    { value: "admin", label: "Administrator" },
    { value: "user", label: "User" }
  ]
}

// Dynamic from API
{
  name: "department",
  type: "dropdown",
  label: "Department",
  endpoint: "/api/departments",
  queryKey: ["departments"],
  optionValueKey: "id",
  optionLabelKey: "name"
}
```

## Layout Options

### Multi-Column

```typescript
<ApiForm
  fields={fields}
  columns={2}  // 2, 3, or 4 columns
/>
```

### Custom Render

```typescript
<ApiForm
  fields={fields}
  customRender={({ form, renderField }) => (
    <div className="custom-layout">
      {renderField(fields[0])}
      <div>Custom content: {form.watch("fieldName")}</div>
      {renderField(fields[1])}
    </div>
  )}
/>
```

## Advanced Features

### Programmatic Control

```typescript
import { useForm } from "@/components/ApiForm";

function MyComponent() {
  const { form, utils } = useForm({ fields });

  // Set value
  utils.setFieldValue("email", "test@example.com");

  // Reset form
  utils.reset();

  // Validate
  const { isValid, errors } = await utils.validate();

  // Get dirty fields
  const dirty = utils.getDirtyFields();
}
```

### Auto-Generate Schema

```typescript
import { generateSchema } from "@/components/ApiForm";

// Automatically create Zod schema from fields
const schema = generateSchema(fields);
```

## Performance Tips

1. **Use `showDirtyOnly` for updates** - Only sends changed fields
2. **Enable `columns` for better layout** - Reduces vertical scrolling
3. **Memoize `onSubmit` handler** - Prevents unnecessary re-renders
4. **Use field-level validation** - Instant feedback without full form validation

## Migration from Old ApiForm

The new ApiForm is 100% backward compatible. To use new features:

1. Add validation: `schema={zodSchema}`
2. Track changes: `showDirtyOnly={true}`
3. Multi-column: `columns={2}`
4. Custom layout: `customRender={...}`

See [MIGRATION.md](./MIGRATION.md) for detailed migration guide.
