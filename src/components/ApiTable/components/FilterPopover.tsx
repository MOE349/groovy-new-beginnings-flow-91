/**
 * FilterPopover Component
 * Provides filtering UI for table columns
 */

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PopoverContent } from "@/components/ui/popover";

interface FilterPopoverProps {
  filterValue: string;
  onFilterChange: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
  onOpenChange: (open: boolean) => void;
}

export const FilterPopover: React.FC<FilterPopoverProps> = ({
  filterValue,
  onFilterChange,
  onApply,
  onClear,
  onOpenChange,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onApply();
      onOpenChange(false);
    }
    if (e.key === "Escape") {
      onOpenChange(false);
    }
  };

  return (
    <PopoverContent className="w-64 p-3" align="start">
      <div className="space-y-3">
        <Input
          value={filterValue}
          onChange={(e) => onFilterChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Filter..."
          className="h-8"
          autoFocus
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => {
              onApply();
              onOpenChange(false);
            }}
            className="flex-1"
          >
            Apply
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              onClear();
              onOpenChange(false);
            }}
            className="flex-1"
          >
            Clear
          </Button>
        </div>
      </div>
    </PopoverContent>
  );
};
