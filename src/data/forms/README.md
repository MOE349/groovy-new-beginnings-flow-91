# 📋 **Centralized Form System Documentation**

## **🎯 Overview**

The centralized form system provides a unified, maintainable approach to form definitions across the TenMil Fleet Management application. This system eliminates duplication, improves consistency, and simplifies form management.

---

## **📁 Directory Structure**

```
src/data/forms/
├── index.ts              # Central form registry & exports
├── settings.forms.ts     # Settings page form definitions
├── common.fields.ts      # Reusable field definitions & factories
└── README.md            # This documentation
```

---

## **🚀 Quick Start**

### **Import Forms**

```typescript
// Import specific forms
import { workOrderStatusFormFields, projectFormFields } from "@/data/forms";

// Or import from specific files
import { workOrderStatusFormFields } from "@/data/forms/settings.forms";
```

### **Use in Components**

```typescript
<ApiForm
  fields={workOrderStatusFormFields}
  onSubmit={handleSubmit}
/>
```

---

## **📖 Available Forms**

### **Settings Forms**

| Form Name                   | Purpose                          | Endpoint                 |
| --------------------------- | -------------------------------- | ------------------------ |
| `workOrderStatusFormFields` | Work order status management     | `/work-orders/status`    |
| `weightClassFormFields`     | Equipment weight classifications | `/assets/weight_class`   |
| `projectFormFields`         | Company projects                 | `/company/projects`      |
| `accountCodeFormFields`     | Accounting codes                 | `/company/account_codes` |
| `jobCodeFormFields`         | Job classifications              | `/company/job_codes`     |
| `assetStatusFormFields`     | Asset status configurations      | `/assets/asset_status`   |

### **Asset Forms**

| Form Name          | Purpose                |
| ------------------ | ---------------------- |
| `equipmentFields`  | Equipment asset forms  |
| `attachmentFields` | Attachment asset forms |

### **Other Forms**

| Form Name                      | Purpose               |
| ------------------------------ | --------------------- |
| `workOrderFields`              | Work order management |
| `siteFormFields`               | Site management       |
| `locationFormFields`           | Location management   |
| `equipmentCategoryFormFields`  | Equipment categories  |
| `attachmentCategoryFormFields` | Attachment categories |

---

## **🔧 Common Field Utilities**

### **Predefined Fields**

```typescript
import {
  nameField,
  codeField,
  descriptionField,
} from "@/data/forms/common.fields";

const myForm = [
  nameField, // Standard name input
  codeField, // Standard code input
  descriptionField, // Standard description textarea
];
```

### **Field Factory Functions**

```typescript
import {
  createTextField,
  createDropdownField,
  createNumberField,
  createDateField,
  createSwitchField,
} from "@/data/forms/common.fields";

// Create a text input
const emailField = createTextField("email", "Email Address", true, "email");

// Create a dropdown
const categoryField = createDropdownField(
  "category",
  "Category",
  "/api/categories",
  ["categories"],
  true
);

// Create a number input
const priceField = createNumberField("price", "Price", true);

// Create a date picker
const dueDateField = createDateField("due_date", "Due Date", false);

// Create a switch/toggle
const activeField = createSwitchField(
  "is_active",
  "Active",
  "Enable or disable this item",
  false
);
```

---

## **🎯 Form Registry System**

### **Programmatic Access**

```typescript
import { FORMS, FORM_METADATA } from "@/data/forms";

// Lazy load form definitions
const loadForm = async (formKey: string) => {
  const formLoader = FORMS[formKey as keyof typeof FORMS];
  if (formLoader) {
    return await formLoader();
  }
  throw new Error(`Form ${formKey} not found`);
};

// Get form metadata
const metadata = FORM_METADATA.workOrderStatus;
console.log(metadata.title); // "Work Order Status"
console.log(metadata.endpoint); // "/work-orders/status"
```

### **Dynamic Form Rendering**

```typescript
const DynamicForm = ({ formKey }: { formKey: string }) => {
  const [fields, setFields] = useState([]);

  useEffect(() => {
    const loadFormFields = async () => {
      try {
        const formFields = await FORMS[formKey]();
        setFields(formFields);
      } catch (error) {
        console.error('Failed to load form:', error);
      }
    };

    loadFormFields();
  }, [formKey]);

  return <ApiForm fields={fields} onSubmit={handleSubmit} />;
};
```

---

## **✨ Benefits**

### **For Developers**

- **🎯 Single Source of Truth**: All forms defined in one location
- **🔄 Reduced Duplication**: Reusable field definitions
- **📝 Better Maintainability**: Easy to update form configurations
- **🎨 Consistent Patterns**: Standardized field creation
- **📖 Self-Documenting**: Clear naming and organization

### **For the Application**

- **⚡ Better Performance**: Lazy loading of form definitions
- **🔧 Easier Testing**: Isolated form logic
- **📦 Smaller Bundle**: Tree-shaking friendly exports
- **🎯 Type Safety**: Full TypeScript support

---

## **📝 Creating New Forms**

### **1. Simple Form (Single File)**

```typescript
// src/data/forms/newFeature.forms.ts
import { FormField } from "@/components/ApiForm";
import { nameField, createTextField } from "./common.fields";

export const newFeatureFormFields: FormField[] = [
  nameField,
  createTextField("description", "Description", false),
];
```

### **2. Export from Registry**

```typescript
// src/data/forms/index.ts
export { newFeatureFormFields } from "./newFeature.forms";

// Add to FORMS registry
export const FORMS = {
  // ... existing forms
  newFeature: () =>
    import("./newFeature.forms").then((m) => m.newFeatureFormFields),
} as const;
```

### **3. Add Metadata (Optional)**

```typescript
// src/data/forms/index.ts
export const FORM_METADATA = {
  // ... existing metadata
  newFeature: {
    title: "New Feature",
    endpoint: "/api/new-feature",
    description: "Manage new feature configurations",
  },
} as const;
```

---

## **🔄 Migration Guide**

### **Before (Inline Definitions)**

```typescript
// ❌ Old approach - inline definitions
const Settings = () => {
  const formFields = [
    {
      name: "name",
      type: "input",
      label: "Name",
      required: true,
      inputType: "text"
    },
    // ... more fields
  ];

  return <ApiForm fields={formFields} onSubmit={handleSubmit} />;
};
```

### **After (Centralized)**

```typescript
// ✅ New approach - centralized import
import { projectFormFields } from "@/data/forms";

const Settings = () => {
  return <ApiForm fields={projectFormFields} onSubmit={handleSubmit} />;
};
```

---

## **🎯 Best Practices**

### **✅ Do**

- Use factory functions for common field patterns
- Import from the main registry (`@/data/forms`)
- Add form metadata for complex forms
- Use descriptive form and field names
- Leverage common field definitions

### **❌ Don't**

- Define forms inline in components
- Duplicate field definitions across files
- Import from individual form files directly
- Mix form logic with component logic
- Ignore TypeScript types

---

## **🚀 Future Enhancements**

### **Planned Features**

- **Form Validation Schemas**: Automatic Zod schema generation
- **Form Templates**: Pre-built form layouts
- **Dynamic Field Loading**: Runtime field configuration
- **Form Analytics**: Usage tracking and optimization
- **Visual Form Builder**: UI for form creation

---

**📚 For more information, see the main [UI Component Inventory](../../../UI_COMPONENT_INVENTORY.md)**
