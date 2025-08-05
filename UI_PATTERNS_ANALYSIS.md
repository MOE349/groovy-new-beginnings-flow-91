# 🔍 **UI Patterns & Inconsistencies Analysis**

## **🎯 Overview**

This analysis identifies **duplicated patterns and inconsistencies** across the component architecture, providing a roadmap for standardization and optimization.

---

## **🚨 Critical Inconsistencies Found**

### **1. Mixed Component Export Patterns**

#### **❌ Inconsistent Export Styles**

```typescript
// Pattern 1: Named function export
export function Layout({ children }: LayoutProps) { ... }
export function AppSidebar() { ... }

// Pattern 2: Default export with React.FC
const PMTriggerContainer: React.FC<PMTriggerContainerProps> = ({ ... }) => { ... }
export const PMTriggerContainer = ...

// Pattern 3: Default export function
const TenMilLogo: React.FC<TenMilLogoProps> = ({ ... }) => { ... }
export default TenMilLogo;

// Pattern 4: Direct export default
export default FormLayout;
export default PMSettingsSelector;
```

#### **✅ Recommended Standard**

```typescript
// Consistent pattern: Named export with function declaration
export function ComponentName({ props }: ComponentNameProps) {
  // component logic
}

// OR: Export const with React.FC for complex components
export const ComponentName: React.FC<ComponentNameProps> = ({ props }) => {
  // component logic
};
```

---

## **2. Toast/Notification Inconsistencies**

### **❌ Mixed Import Patterns**

```typescript
// Pattern 1: Direct toast import
import { toast } from "@/hooks/use-toast";

// Pattern 2: useToast hook import
import { useToast } from "@/hooks/use-toast";
const { toast } = useToast();

// Pattern 3: Wrong path import
import { useToast } from "./ui/use-toast";
```

### **❌ Inconsistent Toast Usage**

```typescript
// Some components use structured objects:
toast({
  title: "Success",
  description: "Operation completed successfully",
});

// Others use minimal objects:
toast({
  title: "Error",
});

// Some use variant prop, others don't:
toast({
  title: "Error",
  description: error.message,
  variant: "destructive",
});
```

#### **✅ Recommended Standard**

```typescript
// Standardized import
import { toast } from "@/hooks/use-toast";

// Standardized usage patterns
// Success toast
toast({
  title: "Success",
  description: "Operation completed successfully",
});

// Error toast
toast({
  title: "Error",
  description: error.message || "Operation failed",
  variant: "destructive",
});
```

---

## **3. Loading State Inconsistencies**

### **❌ Mixed Loading Patterns**

```typescript
// Pattern 1: React Query isLoading
const { data, isLoading } = useQuery({ ... });

// Pattern 2: Local loading state
const [isUploading, setIsUploading] = useState(false);

// Pattern 3: Renamed loading state
const { data, isLoading: loading } = useQuery({ ... });

// Pattern 4: Manual loading prop
loading={loading}
```

### **❌ Inconsistent Loading UI**

```typescript
// Pattern 1: Conditional loading with skeleton
{isLoading ? renderSkeletonForm() : <ActualContent />}

// Pattern 2: Loading spinner
{isLoading ? (
  <div className="flex items-center space-x-2">
    <GearSpinner size="sm" />
    <span>Loading...</span>
  </div>
) : <Content />}

// Pattern 3: Simple loading text
{isLoading && <span>Loading...</span>}

// Pattern 4: Disabled state
disabled={disabled || isLoading}
```

#### **✅ Recommended Standard**

```typescript
// Standardized loading hook pattern
const { data, isLoading, error } = useQuery({
  queryKey: [...],
  queryFn: async () => { ... }
});

// Standardized loading UI components
// For data fetching
{isLoading ? <ContentSkeleton /> : <Content data={data} />}

// For form submissions
<Button disabled={isSubmitting}>
  {isSubmitting ? <Spinner className="mr-2" /> : null}
  {isSubmitting ? "Saving..." : "Save"}
</Button>
```

---

## **4. Error Handling Inconsistencies**

### **❌ Mixed Error Handling Approaches**

```typescript
// Pattern 1: Using handleApiError utility (GOOD)
import { handleApiError } from '@/utils/errorHandling';
try {
  await apiCall(endpoint, data);
} catch (error) {
  handleApiError(error, "Operation failed");
}

// Pattern 2: Manual error handling
} catch (error: any) {
  toast({
    title: "Error",
    description: error.message || "Operation failed",
    variant: "destructive",
  });
}

// Pattern 3: Basic error logging
} catch (error) {
  console.error(error);
}

// Pattern 4: React Query error handling
const { data, error } = useQuery({ ... });
if (error) {
  return <ErrorDisplay error={error} />;
}
```

#### **✅ Recommended Standard**

```typescript
// Centralized error handling utility (already exists)
import { handleApiError } from '@/utils/errorHandling';

// For API calls
try {
  await apiCall(endpoint, data);
  toast({
    title: "Success",
    description: "Operation completed successfully",
  });
} catch (error) {
  handleApiError(error, "Custom error context");
}

// For React Query
const { data, isLoading, error } = useQuery({ ... });

if (error) {
  return <ErrorBoundary error={error} />;
}
```

---

## **5. Styling & ClassName Inconsistencies**

### **❌ Inconsistent Styling Patterns**

```typescript
// Pattern 1: Using cn utility (GOOD)
className={cn("relative", className)}

// Pattern 2: Direct className concatenation
className={`space-y-2 ${className}`}

// Pattern 3: Conditional classes with cn (GOOD)
className={cn(value ? "bg-blue-50/70" : "", className)}

// Pattern 4: Mixed approaches
<div className={cn("space-y-2", className)}>
<Button className="w-full">
```

### **❌ Inconsistent Spacing Classes**

```typescript
// Different spacing conventions:
className = "space-y-2"; // Some use space-y-2
className = "space-y-4"; // Others use space-y-4
className = "space-y-6"; // Others use space-y-6
className = "space-y-1"; // Some use space-y-1
```

#### **✅ Recommended Standard**

```typescript
// Always use cn utility for className composition
import { cn } from "@/lib/utils";

// Standard pattern
<div className={cn("space-y-4", className)}>

// Conditional classes
<Button className={cn(
  "base-classes",
  variant === "primary" && "variant-classes",
  disabled && "disabled-classes",
  className
)}>
```

---

## **6. Data Fetching Inconsistencies**

### **❌ Mixed API Call Patterns**

```typescript
// Pattern 1: Direct apiCall usage
const response = await apiCall("/endpoint");

// Pattern 2: React Query with apiCall
const { data } = useQuery({
  queryKey: ["key"],
  queryFn: async () => {
    const response = await apiCall("/endpoint");
    return response.data?.data || response.data;
  },
});

// Pattern 3: Manual response processing
const response = await apiCall(endpoint);
let data = response.data?.data || response.data || [];
```

### **❌ Inconsistent Query Key Patterns**

```typescript
// Different query key patterns:
queryKey: ["files", linkToModel, linkToId]; // Array format
queryKey: ["/assets/equipment_weight_class"]; // String in array
queryKey: ["dropdown", endpoint]; // Mixed types
queryKey: ["pm-automation", "pm-settings"]; // Kebab-case
```

#### **✅ Recommended Standard**

```typescript
// Standardized query key pattern
queryKey: ["domain", "resource", ...identifiers];

// Examples:
queryKey: ["files", linkToModel, linkToId];
queryKey: ["assets", "equipment", assetId];
queryKey: ["pm", "settings", settingsId];

// Standardized API call pattern
const { data, isLoading, error } = useQuery({
  queryKey: ["domain", "resource", id],
  queryFn: async () => {
    const response = await apiCall(`/endpoint/${id}`);
    return response.data?.data || response.data;
  },
});
```

---

## **🔄 Duplicated Code Patterns**

### **1. File Upload Logic Duplication**

```typescript
// Found in: FilesManager.tsx AND FileUpload.tsx
const handleUpload = async (files: FileList) => {
  setIsUploading(true);
  try {
    // Similar upload logic duplicated
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      // ... rest of upload logic
    }
  } catch (error) {
    handleApiError(error, `Upload failed for ${file.name}`);
  } finally {
    setIsUploading(false);
  }
};
```

### **2. Loading State Management Duplication**

```typescript
// Pattern repeated across multiple components:
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await apiCall(endpoint, data);
    toast({ title: "Success", description: "..." });
  } catch (error) {
    handleApiError(error, "...");
  } finally {
    setLoading(false);
  }
};
```

### **3. Form Validation Pattern Duplication**

```typescript
// Similar validation patterns across components:
const validateForm = () => {
  if (!field1) {
    toast({ title: "Error", description: "Field 1 is required" });
    return false;
  }
  // ... more validation
  return true;
};
```

---

## **📊 Pattern Usage Statistics**

### **Toast Imports**

- ✅ `import { toast } from "@/hooks/use-toast"` - **6 components**
- ❌ `import { useToast } from '@/hooks/use-toast'` - **3 components**
- ❌ `import { useToast } from './ui/use-toast'` - **1 component**

### **Error Handling**

- ✅ Using `handleApiError` utility - **5 components**
- ❌ Manual error handling - **3 components**
- ❌ No error handling - **2 components**

### **Export Patterns**

- ❌ `export default` - **12 components**
- ❌ `export function` - **2 components**
- ❌ `export const ... React.FC` - **3 components**

### **Loading States**

- ✅ React Query `isLoading` - **7 components**
- ❌ Local `useState` loading - **3 components**
- ❌ Props-based loading - **2 components**

---

## **🎯 Standardization Recommendations**

### **Priority 1: Critical Standardization**

1. **Export Patterns** - Standardize all components to consistent export style
2. **Error Handling** - Migrate all to `handleApiError` utility
3. **Toast Usage** - Standardize import and usage patterns

### **Priority 2: High-Impact Standardization**

1. **Loading States** - Consistent loading UI components
2. **Styling Patterns** - Always use `cn` utility
3. **Query Keys** - Standardized naming convention

### **Priority 3: Code Deduplication**

1. **Extract Common Hooks** - `useFileUpload`, `useAsyncOperation`
2. **Create Standard Components** - `LoadingSpinner`, `ErrorDisplay`
3. **Validation Utilities** - Centralized form validation

---

## **🚀 Implementation Plan**

### **Phase 1: Pattern Standardization**

```typescript
// Create standardized patterns
src/patterns/
├── components/
│   ├── LoadingSpinner.tsx
│   ├── ErrorDisplay.tsx
│   └── ContentSkeleton.tsx
├── hooks/
│   ├── useAsyncOperation.ts
│   ├── useFileUpload.ts
│   └── useStandardQuery.ts
└── utils/
    ├── toast.ts
    ├── errors.ts
    └── styling.ts
```

### **Phase 2: Migration Script**

Create automated migration tools to:

- Standardize export patterns
- Update import statements
- Replace manual error handling
- Unify loading state patterns

### **Phase 3: Enforcement**

- ESLint rules for pattern enforcement
- TypeScript strict rules
- Code review guidelines
- Documentation updates

---

**This analysis provides a clear roadmap for eliminating inconsistencies and establishing modern, maintainable patterns across the entire component architecture! 🎯**
