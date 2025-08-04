import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PopoverContent } from "@/components/ui/popover";

interface FilterPopoverProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filterValue: string;
  onFilterChange: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
  hasActiveFilter: boolean;
}

export const FilterPopover = ({
  isOpen,
  onOpenChange,
  filterValue,
  onFilterChange,
  onApply,
  onClear,
  hasActiveFilter,
}: FilterPopoverProps) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onApply();
      onOpenChange(false);
    }
    if (e.key === 'Escape') {
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