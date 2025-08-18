/**
 * Component Registry
 * Centralized exports for all application components
 * Organized by domain for better maintainability
 */

// ✅ Core App Components
export * from "./core";

// ✅ Common UI Components
export * from "./common";

// ✅ Form System (Phase 4)
export * from "./forms";
export * from "./layout";
export * from "./ApiForm";

// ✅ Table System (Phase 4)
export * from "./ApiTable";
export * from "./PartStockLocationTable";

// ✅ Legacy Compatibility (Phase 4)
export * from "./legacy";

// ✅ Domain-Specific Components
export * from "./files";
export * from "./maintenance";
export * from "./financial";
export * from "./utility";

// ✅ Base UI Components (Shadcn/ui)
// Note: These are typically imported directly from './ui/*' as needed
