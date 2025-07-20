import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiCall } from "@/utils/apis";
import { cn } from "@/lib/utils";
import GearSpinner from "@/components/ui/gear-spinner";

interface Location {
  id: string;
  name: string;
}

interface Equipment {
  id: string;
  name: string;
  location?: { id: string };
}

interface LocationEquipmentDropdownProps {
  locationValue?: string;
  equipmentValue?: string;
  onLocationChange?: (locationId: string) => void;
  onEquipmentChange?: (equipmentId: string) => void;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

const LocationEquipmentDropdown = ({
  locationValue,
  equipmentValue,
  onLocationChange,
  onEquipmentChange,
  className,
  required = false,
  disabled = false,
}: LocationEquipmentDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredLocationId, setHoveredLocationId] = useState<string | null>(null);
  const [equipmentMenuPosition, setEquipmentMenuPosition] = useState({ top: 0, left: 0 });
  
  const selectContentRef = useRef<HTMLDivElement>(null);
  const equipmentMenuRef = useRef<HTMLDivElement>(null);

  // Fetch locations
  const {
    data: locations,
    isLoading: locationsLoading,
  } = useQuery({
    queryKey: ["company_location"],
    queryFn: async () => {
      const response = await apiCall("/company/location");
      return response.data.data || response.data;
    },
  });

  // Fetch equipment for all locations
  const {
    data: allEquipment,
    isLoading: equipmentLoading,
  } = useQuery({
    queryKey: ["assets_assets_equipment"],
    queryFn: async () => {
      const response = await apiCall("/assets/assets");
      const data = response.data.data || response.data;
      // Filter only equipment type assets
      return data.filter((asset: any) => asset.type === "equipment");
    },
  });

  // Get equipment for a specific location
  const getEquipmentForLocation = (locationId: string) => {
    if (!allEquipment) return [];
    return allEquipment.filter((equipment: any) => 
      equipment.location?.id === locationId
    );
  };

  // Get location name
  const getLocationName = (locationId: string) => {
    if (!locations) return "";
    const location = locations.find((loc: Location) => loc.id === locationId);
    return location?.name || "";
  };

  const isLoading = locationsLoading || equipmentLoading;

  const handleLocationSelect = (locationId: string) => {
    onLocationChange?.(locationId);
    setIsOpen(false);
    setHoveredLocationId(null);
  };

  const handleEquipmentSelect = (equipmentId: string) => {
    onEquipmentChange?.(equipmentId);
    setHoveredLocationId(null);
  };

  const handleLocationHover = (locationId: string, event: React.MouseEvent) => {
    setHoveredLocationId(locationId);
    
    // Calculate position for equipment menu
    const rect = event.currentTarget.getBoundingClientRect();
    setEquipmentMenuPosition({
      top: rect.top,
      left: rect.right + 8, // 8px gap from the location item
    });
  };

  return (
    <div className={cn("relative", className)}>
      <Select
        value={locationValue}
        onValueChange={handleLocationSelect}
        disabled={disabled || isLoading}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <SelectTrigger className={cn(
          "w-full p-1.5 bg-muted rounded border text-xs text-foreground",
          locationValue && "bg-blue-50/70"
        )}>
          <SelectValue placeholder={isLoading ? "Loading..." : "Select location"} />
          {isLoading && <GearSpinner />}
        </SelectTrigger>
        <SelectContent 
          ref={selectContentRef}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {!locations || locations.length === 0 ? (
            <SelectItem value="__empty__" disabled>
              No locations available
            </SelectItem>
          ) : (
            locations.map((location: Location) => {
              const locationEquipment = getEquipmentForLocation(location.id);
              
              return (
                <SelectItem 
                  key={location.id} 
                  value={location.id}
                  onMouseEnter={(e) => handleLocationHover(location.id, e)}
                  onMouseLeave={() => setHoveredLocationId(null)}
                  className="relative cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{location.name}</span>
                    {locationEquipment.length > 0 && (
                      <span className="text-xs text-muted-foreground ml-2">
                        {locationEquipment.length} equipment →
                      </span>
                    )}
                  </div>
                </SelectItem>
              );
            })
          )}
        </SelectContent>
      </Select>

      {/* Equipment submenu - positioned absolutely relative to viewport */}
      {hoveredLocationId && isOpen && (
        <div
          ref={equipmentMenuRef}
          className="fixed z-[100] w-48 bg-popover border rounded-md shadow-lg"
          style={{
            top: equipmentMenuPosition.top,
            left: equipmentMenuPosition.left,
          }}
          onMouseEnter={() => setHoveredLocationId(hoveredLocationId)}
          onMouseLeave={() => setHoveredLocationId(null)}
        >
          <div className="max-h-48 overflow-auto p-1">
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground border-b">
              Equipment in {getLocationName(hoveredLocationId)}
            </div>
            {(() => {
              const locationEquipment = getEquipmentForLocation(hoveredLocationId);
              
              if (locationEquipment.length === 0) {
                return (
                  <div className="px-2 py-2 text-xs text-muted-foreground">
                    No equipment available
                  </div>
                );
              }

              return locationEquipment.map((equipment: Equipment) => (
                <button
                  key={equipment.id}
                  type="button"
                  className={cn(
                    "w-full px-2 py-1.5 text-xs text-left hover:bg-accent hover:text-accent-foreground rounded-sm",
                    equipmentValue === equipment.id && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => handleEquipmentSelect(equipment.id)}
                >
                  {equipment.name}
                </button>
              ));
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationEquipmentDropdown;