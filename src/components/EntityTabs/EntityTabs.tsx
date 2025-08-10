import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface TabConfig {
  id: string;
  label: string;
  content: React.ReactNode;
  onTabChange?: (tabId: string) => void;
  onMouseEnter?: () => void;
  disabled?: boolean;
  className?: string;
}

export interface EntityTabsProps {
  tabs: TabConfig[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  tabsListClassName?: string;
  tabsTriggerClassName?: string;
  tabsContentClassName?: string;
  orientation?: "horizontal" | "vertical";
}

const EntityTabs: React.FC<EntityTabsProps> = ({
  tabs,
  defaultValue,
  value,
  onValueChange,
  className,
  tabsListClassName,
  tabsTriggerClassName,
  tabsContentClassName,
  orientation = "horizontal",
}) => {
  const handleValueChange = (newValue: string) => {
    onValueChange?.(newValue);
    const tab = tabs.find((t) => t.id === newValue);
    tab?.onTabChange?.(newValue);
  };

  return (
    <div className={cn("h-full flex flex-col", className)}>
      <Tabs
        defaultValue={defaultValue || tabs[0]?.id}
        value={value}
        onValueChange={handleValueChange}
        orientation={orientation}
        className="h-full flex flex-col"
      >
        {/* Tab Header - Fixed height, no overflow */}
        <div className="h-10 flex-shrink-0 overflow-x-auto overflow-y-hidden">
          <TabsList
            className={cn(
              "w-full h-10 bg-card border border-border rounded-md p-0 flex min-w-max",
              tabsListClassName
            )}
          >
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                disabled={tab.disabled}
                onMouseEnter={tab.onMouseEnter}
                className={cn(
                  "flex-1 px-3 py-1 text-caption font-normal text-center",
                  "data-[state=active]:text-primary dark:data-[state=active]:text-secondary",
                  "data-[state=active]:border-b-2 data-[state=active]:border-primary dark:data-[state=active]:border-secondary",
                  "data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "whitespace-nowrap min-w-0 truncate",
                  tabsTriggerClassName,
                  tab.className
                )}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Tab Content - Scrollable area that fits within parent */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {tabs.map((tab) => (
            <TabsContent
              key={tab.id}
              value={tab.id}
              className={cn(
                "h-full flex flex-col tab-content-container overflow-y-auto",
                "data-[state=inactive]:!hidden",
                tabsContentClassName
              )}
            >
              <div className="flex-1 min-h-0">{tab.content}</div>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
};

export default EntityTabs;
