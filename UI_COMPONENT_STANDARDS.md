# 🎨 **UI Component Standards & Style Guide**

## **🎯 Overview**

This comprehensive style guide establishes **standardized patterns and best practices** for component development in the TenMil Fleet Management application. Following these standards ensures consistency, maintainability, and excellent developer experience.

---

## **📂 Component Organization Standards**

### **Directory Structure**
```
src/components/
├── core/                     # Essential app components
├── common/                   # Reusable UI patterns  
├── forms/                    # Form system (UniversalFormField)
├── layout/                   # Layout components (StandardFormLayout)
├── ApiForm/                  # Modular form components
├── ApiTable/                 # Modular table components
├── legacy/                   # Backward compatibility
├── files/                    # File management
├── maintenance/              # PM components
├── financial/                # Financial components
├── utility/                  # Cross-domain utilities
├── ui/                       # Base Shadcn/ui components
└── index.ts                  # Central component registry
```

### **File Naming Conventions**
```typescript
// ✅ Component files: PascalCase
ButtonComponent.tsx
UserProfileCard.tsx
FinancialDataDisplay.tsx

// ✅ Index files: lowercase
index.ts

// ✅ Hook files: camelCase
useAsyncOperation.ts
useStandardQuery.ts

// ✅ Utility files: camelCase  
toast.ts
errorHandling.ts
```

---

## **🔧 Component Definition Standards**

### **✅ Standard Component Pattern**
```typescript
import React from "react";
import { cn } from "@/lib/utils";

export interface ComponentNameProps {
  // Core props
  children?: React.ReactNode;
  className?: string;
  
  // Specific props
  title: string;
  description?: string;
  variant?: "default" | "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  
  // Event handlers
  onClick?: () => void;
  onSubmit?: (data: any) => void;
}

export function ComponentName({
  children,
  className,
  title,
  description,
  variant = "default",
  size = "md",
  disabled = false,
  onClick,
  onSubmit,
}: ComponentNameProps) {
  return (
    <div className={cn("base-classes", 
      variant === "primary" && "primary-classes",
      size === "lg" && "large-classes",
      disabled && "disabled-classes",
      className
    )}>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {children}
    </div>
  );
}

export default ComponentName;
```

### **Export Patterns**
```typescript
// ✅ Preferred: Named function export
export function ComponentName(props: ComponentNameProps) { ... }

// ✅ Alternative: Const with React.FC (for complex components)
export const ComponentName: React.FC<ComponentNameProps> = (props) => { ... }

// ✅ Always provide default export for compatibility
export default ComponentName;
```

---

## **📋 Props Interface Standards**

### **Required Props Structure**
```typescript
export interface ComponentNameProps {
  // 1. Required props first
  title: string;
  data: DataType[];
  
  // 2. Optional props  
  description?: string;
  className?: string;
  
  // 3. Variant/size props with defaults
  variant?: "default" | "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  
  // 4. Boolean props with defaults
  disabled?: boolean;
  loading?: boolean;
  
  // 5. Event handlers last
  onClick?: () => void;
  onSubmit?: (data: FormData) => void;
  onError?: (error: Error) => void;
  
  // 6. Children/render props
  children?: React.ReactNode;
  renderCustom?: (item: DataType) => React.ReactNode;
}
```

### **Common Prop Patterns**
```typescript
// Standard className prop
className?: string;

// Loading state  
loading?: boolean;
isLoading?: boolean;

// Disabled state
disabled?: boolean;

// Variant systems
variant?: "default" | "primary" | "secondary" | "destructive";
size?: "sm" | "md" | "lg";

// Event handlers
onClick?: () => void;
onSubmit?: (data: T) => void | Promise<void>;
onChange?: (value: T) => void;

// Children patterns
children?: React.ReactNode;
```

---

## **🎨 Styling Standards**

### **✅ ClassName Composition Pattern**
```typescript
import { cn } from "@/lib/utils";

// Always use cn utility for className composition
<div className={cn(
  // Base classes first
  "flex items-center space-x-2 p-4",
  
  // Conditional classes  
  variant === "primary" && "bg-primary text-primary-foreground",
  size === "lg" && "text-lg p-6",
  disabled && "opacity-50 cursor-not-allowed",
  
  // User className last (highest priority)
  className
)}>
```

### **Consistent Spacing System**
```typescript
// ✅ Standard spacing classes
"space-y-4"     // Vertical spacing between children
"space-x-4"     // Horizontal spacing between children  
"gap-4"         // Grid/flex gap
"p-4"           // Padding
"m-4"           // Margin

// ✅ Standard padding/margin scale
"p-1"  // 4px
"p-2"  // 8px  
"p-4"  // 16px (most common)
"p-6"  // 24px
"p-8"  // 32px
```

### **Color System Standards**
```typescript
// ✅ Semantic color classes
"bg-background"      // Main background
"bg-card"           // Card background
"bg-primary"        // Primary brand color
"bg-secondary"      // Secondary color
"bg-destructive"    // Error/danger color
"bg-muted"          // Muted background

"text-foreground"   // Main text
"text-muted-foreground" // Secondary text
"text-primary"      // Primary text
"text-destructive"  // Error text
```

---

## **⚡ State Management Standards**

### **Loading States**
```typescript
// ✅ React Query pattern (preferred)
const { data, isLoading, error } = useStandardQuery({
  queryKey: ["domain", "resource", id],
  endpoint: `/api/resource/${id}`
});

// ✅ Local loading state (when needed)
const [isSubmitting, setIsSubmitting] = useState(false);

// ✅ Async operation hook
const { isLoading, execute } = useAsyncOperation({
  successMessage: "Operation completed successfully",
  errorMessage: "Operation failed"
});
```

### **Error Handling**
```typescript
// ✅ Standard error handling pattern
import { handleApiError } from '@/utils/errorHandling';

try {
  await apiCall(endpoint, data);
  standardToasts.saved();
} catch (error) {
  handleApiError(error, "Custom error context");
}

// ✅ Using async operation hook
const handleSubmit = async () => {
  await execute(async () => {
    return await apiCall('/endpoint', { method: 'POST', body: data });
  });
};
```

### **Toast Notifications**
```typescript
// ✅ Standard toast patterns
import { standardToasts } from '@/utils/toast';

// Success scenarios
standardToasts.saved();
standardToasts.created("Asset");
standardToasts.updated("Work Order");

// Error scenarios  
standardToasts.saveFailed();
standardToasts.deleteFailed("Asset");

// Custom toasts
import { showSuccessToast, showErrorToast } from '@/utils/toast';
showSuccessToast("Custom Success", "Details here");
showErrorToast("Custom Error", "Error details");
```

---

## **🔄 Data Fetching Standards**

### **React Query Patterns**
```typescript
// ✅ Standard query pattern
const { data, isLoading, error } = useStandardQuery({
  queryKey: ["assets", "equipment", assetId],
  endpoint: `/assets/equipment/${assetId}`,
  transformData: (data) => data.data || data // Handle response format
});

// ✅ Manual React Query (for complex cases)
const { data, isLoading } = useQuery({
  queryKey: ["domain", "resource", ...params],
  queryFn: async () => {
    const response = await apiCall(endpoint);
    return response.data?.data || response.data;
  }
});

// ✅ Mutations pattern
const mutation = useMutation({
  mutationFn: async (data) => {
    return await apiCall(endpoint, { method: 'POST', body: data });
  },
  onSuccess: () => {
    standardToasts.created("Item");
    queryClient.invalidateQueries({ queryKey: ["items"] });
  },
  onError: (error) => {
    handleApiError(error, "Create failed");
  }
});
```

---

## **🧩 Component Composition Standards**

### **Loading UI Patterns**
```typescript
// ✅ Standard loading patterns
import { LoadingSpinner, ContentSkeleton } from '@/components/common';

// For full page loading
{isLoading ? <LoadingSpinner /> : <Content />}

// For inline loading
{isLoading ? <LoadingSpinner variant="inline" size="sm" /> : null}

// For form loading
{isLoading ? <ContentSkeleton variant="form" lines={3} /> : <Form />}

// For table loading
{isLoading ? <ContentSkeleton variant="table" lines={5} /> : <Table />}
```

### **Error UI Patterns**
```typescript
import { ErrorDisplay } from '@/components/common';

// For full error display
{error && <ErrorDisplay error={error} onRetry={refetch} />}

// For compact error
{error && <ErrorDisplay error={error} variant="compact" />}

// For alert-style error
{error && <ErrorDisplay error={error} variant="alert" />}
```

### **Form Patterns**
```typescript
// ✅ Standard form with layout
import { StandardFormLayout } from '@/components/layout';
import { UniversalFormField } from '@/components/forms';

<StandardFormLayout
  title="Form Title"
  backRoute="/previous-page"
  onSave={handleSubmit}
  loading={isSubmitting}
>
  <UniversalFormField
    name="title"
    type="input"
    label="Title"
    required
    inputValue={title}
    onInputChange={setTitle}
  />
</StandardFormLayout>
```

---

## **📝 Documentation Standards**

### **Component Documentation**
```typescript
/**
 * ComponentName - Brief description of what the component does
 * 
 * @example
 * <ComponentName
 *   title="Example Title"
 *   variant="primary"
 *   onClick={() => console.log('clicked')}
 * />
 */
export function ComponentName({ ... }: ComponentNameProps) {
  // Component implementation
}
```

### **Props Documentation**
```typescript
export interface ComponentNameProps {
  /** The main title displayed in the component */
  title: string;
  
  /** Optional description text */
  description?: string;
  
  /** Visual variant of the component */
  variant?: "default" | "primary" | "secondary";
  
  /** Size variant */
  size?: "sm" | "md" | "lg";
  
  /** Whether the component is disabled */
  disabled?: boolean;
  
  /** Callback fired when component is clicked */
  onClick?: () => void;
  
  /** Additional CSS classes */
  className?: string;
}
```

---

## **🚀 Performance Standards**

### **Memoization Guidelines**
```typescript
// ✅ Memo for expensive components
export const ComponentName = React.memo(function ComponentName(props) {
  // Component logic
});

// ✅ useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return complexCalculation(data);
}, [data]);

// ✅ useCallback for event handlers passed to children
const handleClick = useCallback(() => {
  // Handler logic
}, [dependency]);
```

### **Code Splitting**
```typescript
// ✅ Lazy loading for large components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// ✅ Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <HeavyComponent />
</Suspense>
```

---

## **✅ Best Practices Checklist**

### **Component Creation**
- [ ] Component follows naming conventions
- [ ] Props interface is well-defined with proper types
- [ ] Component uses `cn` utility for className composition
- [ ] Default export is provided for compatibility
- [ ] Error boundaries are considered for error-prone components

### **Styling**
- [ ] Uses semantic Tailwind classes
- [ ] Follows spacing conventions
- [ ] Implements proper responsive design
- [ ] Supports dark/light theme
- [ ] Accessible color contrast

### **Functionality**
- [ ] Loading states are handled consistently
- [ ] Error states have proper UX
- [ ] Form validation follows patterns
- [ ] API calls use standard patterns
- [ ] Toast notifications use standard utilities

### **Performance**
- [ ] Components are memoized when appropriate
- [ ] Expensive operations use useMemo/useCallback
- [ ] Large components are code-split
- [ ] Bundle impact is considered

### **Testing & Accessibility**
- [ ] Component is keyboard accessible
- [ ] ARIA labels are provided where needed
- [ ] Component works with screen readers
- [ ] TypeScript strict mode compatibility

---

## **🛠️ Development Tools**

### **ESLint Rules** (Recommended additions)
```json
{
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "warn",
    "react/prop-types": "off",
    "react-hooks/exhaustive-deps": "error",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

### **VS Code Snippets**
```json
{
  "React Component": {
    "prefix": "rfc",
    "body": [
      "import React from 'react';",
      "import { cn } from '@/lib/utils';",
      "",
      "export interface ${1:ComponentName}Props {",
      "  className?: string;",
      "  children?: React.ReactNode;",
      "}",
      "",
      "export function ${1:ComponentName}({",
      "  className,",
      "  children,",
      "}: ${1:ComponentName}Props) {",
      "  return (",
      "    <div className={cn('', className)}>",
      "      {children}",
      "    </div>",
      "  );",
      "}",
      "",
      "export default ${1:ComponentName};"
    ]
  }
}
```

---

**🎯 Following these standards ensures consistent, maintainable, and high-quality component development across the entire TenMil Fleet Management application!**