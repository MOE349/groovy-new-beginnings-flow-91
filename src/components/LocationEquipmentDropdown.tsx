import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
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
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isHoveringEquipment, setIsHoveringEquipment] = useState(false);
  
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

  // Memoized equipment lookup for a specific location
  const getEquipmentForLocation = useCallback((locationId: string) => {
    if (!allEquipment) return [];
    return allEquipment.filter((equipment: any) => 
      equipment.location?.id === locationId
    );
  }, [allEquipment]);

  // Memoized location lookup
  const getLocationName = useCallback((locationId: string) => {
    if (!locations) return "";
    const location = locations.find((loc: Location) => loc.id === locationId);
    return location?.name || "";
  }, [locations]);

  // Memoized equipment lookup  
  const getEquipmentName = useCallback((equipmentId: string) => {
    if (!allEquipment) return "";
    const equipment = allEquipment.find((eq: Equipment) => eq.id === equipmentId);
    return equipment?.name || "";
  }, [allEquipment]);

  // Memoized display text for the select trigger
  const getDisplayText = useMemo(() => {
    const locationName = locationValue ? getLocationName(locationValue) : "";
    const equipmentName = equipmentValue ? getEquipmentName(equipmentValue) : "";
    
    if (locationName && equipmentName) {
      return `${locationName} → ${equipmentName}`;
    } else if (locationName) {
      return locationName;
    } else {
      return "";
    }
  }, [locationValue, equipmentValue, getLocationName, getEquipmentName]);

  const isLoading = locationsLoading || equipmentLoading;

  const clearHideTimeout = useCallback(() => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
  }, [hideTimeout]);

  const setHideSubMenuTimeout = useCallback(() => {
    clearHideTimeout();
    const timeout = setTimeout(() => {
      setHoveredLocationId(null);
      setIsHoveringEquipment(false);
    }, 150);
    setHideTimeout(timeout);
  }, [clearHideTimeout]);

  const handleLocationSelect = useCallback((locationId: string) => {
    onLocationChange?.(locationId);
    setIsOpen(false);
    setHoveredLocationId(null);
    clearHideTimeout();
  }, [onLocationChange, clearHideTimeout]);

  const handleEquipmentSelect = useCallback((equipmentId: string) => {
    onEquipmentChange?.(equipmentId);
    setHoveredLocationId(null);
    setIsOpen(false);
    setIsHoveringEquipment(false);
    clearHideTimeout();
  }, [onEquipmentChange, clearHideTimeout]);

  const handleLocationHover = useCallback((locationId: string, event: React.MouseEvent) => {
    clearHideTimeout();
    setHoveredLocationId(locationId);
    
    // Calculate position for equipment menu
    const rect = event.currentTarget.getBoundingClientRect();
    setEquipmentMenuPosition({
      top: rect.top,
      left: rect.right, // No gap for seamless transition
    });
  }, [clearHideTimeout]);

  const handleLocationLeave = useCallback(() => {
    // Only hide if not hovering over equipment menu
    if (!isHoveringEquipment) {
      setHideSubMenuTimeout();
    }
  }, [isHoveringEquipment, setHideSubMenuTimeout]);

  const handleEquipmentMenuEnter = useCallback(() => {
    setIsHoveringEquipment(true);
    clearHideTimeout();
  }, [clearHideTimeout]);

  const handleEquipmentMenuLeave = useCallback(() => {
    setIsHoveringEquipment(false);
    setHideSubMenuTimeout();
  }, [setHideSubMenuTimeout]);

  // Debug: Track prop changes
  useEffect(() => {
    console.log('LocationEquipmentDropdown - equipmentValue changed:', equipmentValue);
    console.log('LocationEquipmentDropdown - locationValue changed:', locationValue);
  }, [equipmentValue, locationValue]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHoveredLocationId(null);
        if (hideTimeout) {
          clearTimeout(hideTimeout);
          setHideTimeout(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [hideTimeout]);

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Custom dropdown trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || isLoading}
        className={cn(
          "w-full p-1.5 bg-muted rounded border text-xs text-foreground text-left flex items-center justify-between",
          (locationValue || equipmentValue) && "bg-blue-50/70",
          "hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
        )}
      >
        {isLoading ? (
          <>
            <span>Loading...</span>
            <GearSpinner />
          </>
        ) : (
          <>
            <span className="truncate">
              {getDisplayText() || "Select location"}
            </span>
            <ChevronDown className="h-3 w-3 shrink-0" />
          </>
        )}
      </button>

      {/* Custom dropdown content */}
      {isOpen && !isLoading && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full bg-popover border rounded-md shadow-lg">
          <div className="max-h-60 overflow-auto p-1">
            {!locations || locations.length === 0 ? (
              <div className="px-3 py-2 text-xs text-muted-foreground">
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
                    onMouseEnter={(e) => handleLocationHover(location.id, e)}
                    onMouseLeave={handleLocationLeave}
                  >
                    <div
                      className={cn(
                        "w-full px-3 py-2 text-xs text-left hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer flex items-center justify-between",
                        isSelected && "bg-accent text-accent-foreground"
                      )}
                      onClick={() => handleLocationSelect(location.id)}
                    >
                      <span>{location.name}</span>
                      {locationEquipment.length > 0 && (
                        <span className="text-xs text-muted-foreground ml-2">
                          {locationEquipment.length} equipment →
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Bridge element to prevent mouse leave gaps */}
      {hoveredLocationId && isOpen && (
        <div
          className="fixed z-[99] pointer-events-none"
          style={{
            top: equipmentMenuPosition.top,
            left: equipmentMenuPosition.left - 10,
            width: '10px',
            height: '100px',
          }}
        />
      )}

      {/* Equipment submenu - with smooth transitions */}
      {hoveredLocationId && isOpen && (
        <div
          ref={equipmentMenuRef}
          className="fixed z-[100] w-48 bg-popover border rounded-md shadow-lg transition-all duration-200 ease-out animate-scale-in"
          style={{
            top: equipmentMenuPosition.top,
            left: equipmentMenuPosition.left,
          }}
          onMouseEnter={handleEquipmentMenuEnter}
          onMouseLeave={handleEquipmentMenuLeave}
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
                <div
                  key={equipment.id}
                  className={cn(
                    "w-full px-2 py-1.5 text-xs text-left hover:bg-accent hover:text-accent-foreground rounded-sm transition-all duration-150 cursor-pointer",
                    equipmentValue === equipment.id && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => handleEquipmentSelect(equipment.id)}
                >
                  {equipment.name}
                </div>
              ));
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationEquipmentDropdown;