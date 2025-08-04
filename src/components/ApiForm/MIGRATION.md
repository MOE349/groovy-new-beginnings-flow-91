# ApiForm Migration Guide

## Overview

The ApiForm component has been refactored from a monolithic 246-line file to a modular, performant structure with React Hook Form and Zod validation.

## Key Improvements

### 1. **Modular Structure**

```
src/components/ApiForm/
├── index.tsx              # Main component (140 lines)
├── types.ts               # TypeScript types
├── hooks/
│   └── useForm.ts         # React Hook Form integration
├── fields/
│   ├── InputField.tsx     # Input field component
│   ├── TextareaField.tsx  # Textarea field component
│   ├── SwitchField.tsx    # Switch field component
│   ├── DatePickerField.tsx # Date picker component
│   └── DropdownField.tsx  # Dropdown field component
├── components/
│   └── FieldRenderer.tsx  # Dynamic field renderer
└── utils/
    └── validation.ts      # Zod validation utilities
```

### 2. **Performance Optimizations**

- React Hook Form for optimal re-renders
- Field-level validation
- Memoized field rendering
- Controlled updates only when needed
- No unnecessary state changes

### 3. **Built-in Validation**

- Zod schema integration
- Automatic validation from field config
- Type-safe form values
- Custom validation rules

### 4. **Better Developer Experience**

- Full TypeScript support
- IntelliSense for form values
- Type-safe field configurations
- Clear error messages

## Migration Notes

### Backward Compatibility

The new ApiForm maintains **100% backward compatibility** with the old API:

```typescript
// Old usage - still works!
import ApiForm, { FormField } from "@/components/ApiForm";

const fields: FormField[] = [
  { name: "email", type: "input", inputType: "email", required: true },
  { name: "message", type: "textarea", rows: 3 }
];

<ApiForm fields={fields} onSubmit={handleSubmit} />
```

### New Features Available

While maintaining compatibility, you can now use advanced features:

#### 1. **Validation with Zod**

```typescript
import { z } from "zod";
import { ApiForm } from "@/components/ApiForm";

const schema = z.object({
  email: z.string().email(),
  age: z.number().min(18).max(100),
});

<ApiForm
  fields={fields}
  schema={schema}
  onSubmit={(data) => {
    // data is fully typed!
    console.log(data.email); // TypeScript knows this is a string
  }}
/>
```

#### 2. **Dirty Field Tracking**

```typescript
<ApiForm
  fields={fields}
  showDirtyOnly={true}
  onSubmit={(data, dirtyFields) => {
    // Only submit changed fields for PATCH requests
    console.log("Changed fields:", dirtyFields);
  }}
/>
```

#### 3. **Multi-Column Layouts**

```typescript
<ApiForm
  fields={fields}
  columns={2} // 2-column grid layout
  layout="horizontal" // Label beside field
/>
```

#### 4. **Form Utilities**

```typescript
import { useForm } from "@/components/ApiForm";

function CustomForm() {
  const { form, utils } = useForm({ fields, defaultValues });

  // Programmatic control
  utils.setFieldValue("email", "test@example.com");
  utils.reset();

  const dirtyFields = utils.getDirtyFields();
}
```

## Performance Comparison

### Before:

- Full re-render on any field change
- Manual state management
- No field-level optimization
- All validation on submit

### After:

- Only changed fields re-render
- React Hook Form optimization
- Field-level validation
- Minimal re-renders

## Type Safety Improvements

### Before:

```typescript
onSubmit={(data: Record<string, any>) => {
  // No type safety
  console.log(data.email); // any
})
```

### After:

```typescript
onSubmit={(data) => {
  // Full type inference
  console.log(data.email); // string
  console.log(data.age); // number
})
```

## Common Migration Patterns

### 1. **Custom Layouts**

Before:

```typescript
customLayout={({ handleSubmit, renderField, ... }) => (
  <div>{/* Complex layout */}</div>
)}
```

After:

```typescript
customRender={({ form, renderField, ... }) => (
  <div>{/* Cleaner API */}</div>
)}
```

### 2. **Validation**

Before:

```typescript
// Manual validation in onSubmit
onSubmit={(data) => {
  if (!data.email.includes('@')) {
    // Show error somehow
  }
}}
```

After:

```typescript
// Automatic with schema
schema={z.object({
  email: z.string().email("Invalid email")
})}
```

### 3. **Change Tracking**

Before:

```typescript
// Complex manual logic to track changes
const updatedData = {};
Object.keys(formData).forEach((key) => {
  if (JSON.stringify(initialValue) !== JSON.stringify(currentValue)) {
    updatedData[key] = currentValue;
  }
});
```

After:

```typescript
// Automatic with showDirtyOnly
showDirtyOnly={true}
onSubmit={(data, dirtyFields) => {
  // Only changed fields
}}
```

## Breaking Changes

None! The refactoring maintains full backward compatibility while adding new optional features.

### Custom Layouts Preserved

The refactored ApiForm maintains full support for the existing `customLayout` prop used in EditAsset and EditWorkOrder pages:

```typescript
// Still works exactly as before!
<ApiForm
  fields={fields}
  initialData={data}
  customLayout={({ fields, formData, handleFieldChange, handleSubmit, loading, error, renderField, initialData }) => (
    <div>
      {/* Your custom layout */}
      {renderField(fields[0])}
      <button onClick={handleSubmit}>Save</button>
    </div>
  )}
/>
```

The new `customRender` prop is available for new implementations that want to use React Hook Form directly:

```typescript
// New way with direct React Hook Form access
<ApiForm
  fields={fields}
  defaultValues={data}
  customRender={({ form, fields, renderField, isSubmitting, error }) => (
    <div>
      {/* Direct access to React Hook Form */}
      {renderField(fields[0])}
      <button onClick={form.handleSubmit(onSubmit)}>Save</button>
    </div>
  )}
/>
```
