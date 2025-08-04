/**
 * ApiTable Compatibility Wrapper
 * This file ensures backward compatibility with the old import path
 * while redirecting to the new modular implementation
 */

export {
  ApiTable as default,
  ApiTable,
  type TableColumn,
} from "./ApiTable/index";
export type { ApiTableProps } from "./ApiTable/index";
