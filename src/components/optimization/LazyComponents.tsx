/**
 * Lazy-loaded components for better performance
 * Use these instead of direct imports for large components
 */

import React, { lazy, Suspense } from "react";
import { LoadingSpinner } from "@/components/common";

// Lazy load heavy components
const LazyApiTable = lazy(() => import("@/components/ApiTable").then(module => ({ default: module.ApiTable })));
const LazyApiForm = lazy(() => import("@/components/ApiForm").then(module => ({ default: module.ApiForm })));
const LazyFinancialsTab = lazy(() => import("@/components/FinancialsTabContent"));
const LazyPartsBomTab = lazy(() => import("@/components/PartsBomTabContent"));

// Wrapper components with suspense
export const ApiTableLazy = React.memo((props: any) => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyApiTable {...props} />
  </Suspense>
));

export const ApiFormLazy = React.memo((props: any) => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyApiForm {...props} />
  </Suspense>
));

export const FinancialsTabLazy = React.memo((props: any) => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyFinancialsTab {...props} />
  </Suspense>
));

export const PartsBomTabLazy = React.memo((props: any) => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyPartsBomTab {...props} />
  </Suspense>
));

// Display names for debugging
ApiTableLazy.displayName = "ApiTableLazy";
ApiFormLazy.displayName = "ApiFormLazy";
FinancialsTabLazy.displayName = "FinancialsTabLazy";
PartsBomTabLazy.displayName = "PartsBomTabLazy";