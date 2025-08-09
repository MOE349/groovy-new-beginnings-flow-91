Global App Shell and One-Scroller Contract

Breakpoints

- fhd (1920px): baseline desktop
- xxl (2560px): large desktop

Rules

- Page root never scrolls vertically. Only the page body (inside AppPage) may scroll vertically below FHD.
- At/above FHD: no page-level scrollbars; sidebar is expanded; top sections are fully visible.
- Horizontal overflow handling priority:
  1. Collapse sidebar below FHD automatically
  2. Allow inner horizontal scroll for tables/grids in the body
  3. Allow page-level horizontal scroll only under 1280px if necessary

Components

- AppPage: Top/Toolbar (non-scrolling) + Body (only vertical scroller below FHD)
- Layout/AdminLayout: Global shell with header and sidebar, page root locked to viewport height

Usage

```tsx
import { AppPage } from "@/components/layout";

export function MyPage() {
  return (
    <AppPage
      top={<div>Entity header / breadcrumbs</div>}
      toolbar={<div>Tabs header / filters</div>}
    >
      <div className="overflow-x-auto">
        {/* Tables/grids/forms here. Use min-widths as needed. */}
      </div>
    </AppPage>
  );
}
```

Notes

- Do not introduce mobile/tablet stacks. Desktop only.
- Avoid nested vertical scrollers. If needed, use sticky elements within the AppPage body.
