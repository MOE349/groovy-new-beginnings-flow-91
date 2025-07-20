import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check } from "lucide-react";
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
  location_id?: string;
}

interface LocationEquipmentDropdownProps {
  locationValue?: string;
  equipmentValue?: string;
  onLocationChange?: (locationId: string, locationName: string) => void;
  onEquipmentChange?: (equipmentId: string, equipmentName: string) => void;
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
  const [selectedLocationName, setSelectedLocationName] = useState<string>("");
  const [selectedEquipmentName, setSelectedEquipmentName] = useState<string>("");
  
  const dropdownRef = useRef<HTMLDivElement>(null);
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

  // Update selected names when values change
  useEffect(() => {
    if (locationValue && locations) {
      const location = locations.find((loc: Location) => loc.id === locationValue);
      setSelectedLocationName(location?.name || "");
    }
  }, [locationValue, locations]);

  useEffect(() => {
    if (equipmentValue && allEquipment) {
      const equipment = allEquipment.find((eq: Equipment) => eq.id === equipmentValue);
      setSelectedEquipmentName(equipment?.name || "");
    }
  }, [equipmentValue, allEquipment]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHoveredLocationId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLocationSelect = (location: Location) => {
    onLocationChange?.(location.id, location.name);
    setSelectedLocationName(location.name);
    
    // If this location has no equipment, close the dropdown
    const locationEquipment = getEquipmentForLocation(location.id);
    if (locationEquipment.length === 0) {
      setIsOpen(false);
      setHoveredLocationId(null);
    }
  };

  const handleEquipmentSelect = (equipment: Equipment) => {
    onEquipmentChange?.(equipment.id, equipment.name);
    setSelectedEquipmentName(equipment.name);
    setIsOpen(false);
    setHoveredLocationId(null);
  };

  const displayText = () => {
    if (selectedLocationName && selectedEquipmentName) {
      return `${selectedLocationName} → ${selectedEquipmentName}`;
    }
    if (selectedLocationName) {
      return selectedLocationName;
    }
    return "Select location and equipment";
  };

  const isLoading = locationsLoading || equipmentLoading;

  return (
    <div className={cn("space-y-2 relative", className)} ref={dropdownRef}>
      <Label className={required ? "after:content-['*'] after:text-destructive" : ""}>
        Location & Equipment
      </Label>
      
      <Button
        type="button"
        variant="outline"
        className={cn(
          "w-full justify-between text-left font-normal",
          !locationValue && !equipmentValue && "text-muted-foreground",
          (locationValue || equipmentValue) && "bg-blue-50/70"
        )}
        disabled={disabled || isLoading}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">
          {isLoading ? "Loading..." : displayText()}
        </span>
        {isLoading ? <GearSpinner /> : <ChevronDown className="h-4 w-4 shrink-0" />}
      </Button>

      {isOpen && !isLoading && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full bg-popover border rounded-md shadow-lg">
          <div className="max-h-60 overflow-auto p-1">
            {!locations || locations.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No locations available
              </div>
            ) : (
              locations.map((location: Location) => {
                const locationEquipment = getEquipmentForLocation(location.id);
                const isSelected = locationValue === location.id;
                
                return (
                  <div
                    key={location.id}
                    className="relative"
                    onMouseEnter={() => setHoveredLocationId(location.id)}
                    onMouseLeave={() => {
                      // Only clear if we're not hovering over the equipment menu
                      setTimeout(() => {
                        if (!equipmentMenuRef.current?.matches(':hover')) {
                          setHoveredLocationId(null);
                        }
                      }, 100);
                    }}
                  >
                    <button
                      type="button"
                      className={cn(
                        "w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground rounded-sm flex items-center justify-between",
                        isSelected && "bg-accent text-accent-foreground"
                      )}
                      onClick={() => handleLocationSelect(location)}
                    >
                      <span>{location.name}</span>
                      <div className="flex items-center gap-2">
                        {locationEquipment.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {locationEquipment.length} equipment
                          </span>
                        )}
                        {isSelected && <Check className="h-4 w-4" />}
                      </div>
                    </button>

                    {/* Equipment submenu */}
                    {hoveredLocationId === location.id && locationEquipment.length > 0 && (
                      <div
                        ref={equipmentMenuRef}
                        className="absolute left-full top-0 z-50 ml-1 w-64 bg-popover border rounded-md shadow-lg"
                        onMouseEnter={() => setHoveredLocationId(location.id)}
                        onMouseLeave={() => setHoveredLocationId(null)}
                      >
                        <div className="max-h-48 overflow-auto p-1">
                          <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b">
                            Equipment in {location.name}
                          </div>
                          {locationEquipment.map((equipment: Equipment) => {
                            const isEquipmentSelected = equipmentValue === equipment.id;
                            
                            return (
                              <button
                                key={equipment.id}
                                type="button"
                                className={cn(
                                  "w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground rounded-sm flex items-center justify-between",
                                  isEquipmentSelected && "bg-accent text-accent-foreground"
                                )}
                                onClick={() => handleEquipmentSelect(equipment)}
                              >
                                <span>{equipment.name}</span>
                                {isEquipmentSelected && <Check className="h-4 w-4" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationEquipmentDropdown;