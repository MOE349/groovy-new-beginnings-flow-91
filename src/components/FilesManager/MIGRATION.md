# FilesManager Refactoring Migration Guide

## Overview

The FilesManager component has been refactored from a monolithic 633-line component into a modular, maintainable architecture following the project's established patterns.

## New Structure

```
src/components/FilesManager/
├── index.tsx                 # Main component orchestrator
├── types.ts                  # Shared type definitions
├── components/               # UI components
│   ├── FileUploadDialog.tsx
│   ├── FileEditDialog.tsx
│   ├── FilesTable.tsx
│   ├── FileUploadZone.tsx
│   └── FileActions.tsx
├── hooks/                    # Custom hooks
│   ├── useFileData.ts
│   ├── useFileOperations.ts
│   └── useFileUpload.ts
└── MIGRATION.md             # This file
```

## Service Layer

```
src/services/api/fileService.ts  # Centralized API operations
```

## Breaking Changes

**None!** The refactoring maintains full backward compatibility:

- Same import path: `import FilesManager from "@/components/FilesManager"`
- Same component props interface
- Same functionality and behavior

## Benefits

- **Modularity**: Components have single responsibilities
- **Reusability**: Smaller components can be used independently
- **Maintainability**: Easier to modify and test individual pieces
- **Performance**: Better code splitting and re-rendering optimization
- **Consistency**: Follows project patterns (ApiForm, ApiTable, custom hooks)
- **Type Safety**: Improved TypeScript support with dedicated types

## Architecture Patterns Used

- **Custom Hooks**: Following `useAssetData`, `useAsyncOperation` patterns
- **Service Layer**: Centralized API operations like existing services
- **Component Composition**: Modular components like `ApiForm/` structure
- **Type Safety**: Dedicated types file like `ApiTable/types.ts`
- **Memory Preferences**: Maintains className usage and PATCH methods

## Migration Impact

- ✅ FileManagerField: Updated automatically
- ✅ EntityTabs/FilesTab: Updated automatically
- ✅ All existing functionality preserved
- ✅ No breaking changes to public API

## Usage Examples

### Basic Usage (unchanged)

```tsx
<FilesManager linkToModel="assets.equipment" linkToId="123" maxSize={25} />
```

### Individual Components (new capability)

```tsx
import { FileUploadDialog, FilesTable } from "@/components/FilesManager";

// Use components individually for custom layouts
<FileUploadDialog
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  linkToModel="assets.equipment"
  linkToId="123"
  maxSize={25}
/>;
```

### Custom Hooks (new capability)

```tsx
import {
  useFileOperations,
  useFileData,
} from "@/components/FilesManager/hooks";

const MyComponent = () => {
  const { deleteFile, downloadFile } = useFileOperations(
    "assets.equipment",
    "123"
  );
  const { data: files, isLoading } = useFileData("assets.equipment", "123");

  // Custom file management logic
};
```

## Testing

All functionality has been preserved and follows the same patterns as existing components in the project.
