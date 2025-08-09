import React from "react";

type AppPageProps = {
  /** Top information/header section that never scrolls */
  top?: React.ReactNode;
  /** Optional toolbar (e.g., tabs headers/filters); non-scrolling */
  toolbar?: React.ReactNode;
  /** The main scrollable body. This is the ONLY vertical scroller below FHD. */
  children: React.ReactNode;
  /** Optional class for root container */
  className?: string;
  /** Optional body className for custom layouts */
  bodyClassName?: string;
};

/**
 * AppPage
 * Enforces the global Top/Body layout and the one-scroller rule.
 * - Top and toolbar never scroll
 * - Body is the sole vertical scroller on sub-FHD screens
 * - Horizontal overflow is handled inside the body; page-level horizontal scroll is a last resort (<1280px)
 */
export function AppPage({
  top,
  toolbar,
  children,
  className = "",
  bodyClassName = "",
}: AppPageProps) {
  return (
    <div className={`flex flex-col min-h-0 min-w-0 w-full h-full ${className}`}>
      {top ? <div className="shrink-0">{top}</div> : null}

      {toolbar ? <div className="shrink-0">{toolbar}</div> : null}

      <div
        className={`flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden ${bodyClassName}`}
        role="region"
        aria-label="Page body"
        tabIndex={-1}
      >
        {children}
      </div>
    </div>
  );
}

export default AppPage;
