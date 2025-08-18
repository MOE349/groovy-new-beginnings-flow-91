import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { apiCall } from "@/utils/apis";
import { cn } from "@/lib/utils";
import GearSpinner from "@/components/ui/gear-spinner";

// Normalize various backend list response shapes to a plain array
function extractListData(payload: any): any[] {
  if (!payload) return [];
  // Common shapes: { data: [...] }, { results: [...] }, [...]
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.results)) return payload.results;
  if (payload.data && Array.isArray(payload.data.results)) return payload.data.results;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
}

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
  const [hoveredLocationId, setHoveredLocationId] = useState<string | null>(
    null
  );
  const [equipmentMenuPosition, setEquipmentMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch locations
  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ["company_location"],
    queryFn: async () => {
      const response = await apiCall("/company/location");
      return extractListData(response.data);
    },
  });

  // Fetch equipment for all locations
  const { data: allEquipment, isLoading: equipmentLoading } = useQuery({
    queryKey: ["assets_assets_equipment"],
    queryFn: async () => {
      const response = await apiCall("/assets/assets");
      const data = extractListData(response.data);
      // Filter only equipment type assets
      return data.filter((asset: any) => asset?.type === "equipment");
    },
  });

  // Get equipment for a specific location
  const getEquipmentForLocation = (locationId: string) => {
    if (!Array.isArray(allEquipment)) return [];
    return allEquipment.filter(
      (equipment: any) => equipment.location?.id === locationId
    );
  };

  // Get location name
  const getLocationName = (locationId: string) => {
    if (!Array.isArray(locations)) return "";
    const location = locations.find((loc: Location) => loc.id === locationId);
    return location?.name || "";
  };

  // Get equipment name
  const getEquipmentName = (equipmentId: string) => {
    if (!Array.isArray(allEquipment)) return "";
    const equipment = allEquipment.find(
      (eq: Equipment) => eq.id === equipmentId
    );
    return equipment?.name || "";
  };

  // Get display text for the select trigger
  const getDisplayText = () => {
    const locationName = locationValue ? getLocationName(locationValue) : "";
    const equipmentName = equipmentValue
      ? getEquipmentName(equipmentValue)
      : "";

    console.log(
      "getDisplayText - locationValue:",
      locationValue,
      "locationName:",
      locationName
    );
    console.log(
      "getDisplayText - equipmentValue:",
      equipmentValue,
      "equipmentName:",
      equipmentName
    );

    if (locationName && equipmentName) {
      return `${locationName} → ${equipmentName}`;
    } else if (locationName) {
      return locationName;
    } else {
      return "";
    }
  };

  const isLoading = locationsLoading || equipmentLoading;

  const handleLocationSelect = (locationId: string) => {
    console.log("Location selected:", locationId);
    onLocationChange?.(locationId);
    setIsOpen(false);
    setHoveredLocationId(null);
  };

  const handleEquipmentSelect = (equipmentId: string) => {
    console.log("Equipment selected:", equipmentId);
    const equipmentName = getEquipmentName(equipmentId);
    console.log("Equipment name:", equipmentName);
    onEquipmentChange?.(equipmentId);
    setHoveredLocationId(null);
    setIsOpen(false);
  };

  const handleLocationHover = (locationId: string, event: React.MouseEvent) => {
    console.log("Hovering over location:", locationId);

    // Clear any pending hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    setHoveredLocationId(locationId);

    // Calculate position for equipment menu
    const rect = event.currentTarget.getBoundingClientRect();
    setEquipmentMenuPosition({
      top: rect.top,
      left: rect.right + 4,
    });
  };

  const handleLocationLeave = useCallback(() => {
    // Add a delay before hiding the equipment menu
    hideTimeoutRef.current = setTimeout(() => {
      setHoveredLocationId(null);
    }, 300); // 300ms delay
  }, []);

  const handleEquipmentMenuEnter = useCallback(() => {
    // Clear the hide timeout when entering equipment menu
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const handleEquipmentMenuLeave = useCallback(() => {
    // Hide immediately when leaving equipment menu
    setHoveredLocationId(null);
  }, []);

  // Debug: Track prop changes
  useEffect(() => {
    console.log(
      "LocationEquipmentDropdown - equipmentValue changed:",
      equipmentValue
    );
    console.log(
      "LocationEquipmentDropdown - locationValue changed:",
      locationValue
    );
  }, [equipmentValue, locationValue]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHoveredLocationId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      // Clean up timeout on unmount
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

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
        <div
          className="fixed z-50 w-64 bg-popover border rounded-md shadow-lg"
          style={{
            top: dropdownRef.current
              ? dropdownRef.current.getBoundingClientRect().bottom + 4
              : 0,
            left: dropdownRef.current
              ? dropdownRef.current.getBoundingClientRect().left
              : 0,
            width: dropdownRef.current
              ? dropdownRef.current.getBoundingClientRect().width
              : "auto",
          }}
        >
          <div className="max-h-60 overflow-auto p-1">
            {!Array.isArray(locations) || locations.length === 0 ? (
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

      {/* Equipment submenu - completely separate from main dropdown */}
      {hoveredLocationId && isOpen && (
        <div
          className="fixed z-[100] w-48 bg-popover border rounded-md shadow-lg"
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
              const locationEquipment =
                getEquipmentForLocation(hoveredLocationId);

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
                    "w-full px-2 py-1.5 text-xs text-left hover:bg-accent hover:text-accent-foreground rounded-sm transition-colors cursor-pointer",
                    equipmentValue === equipment.id &&
                      "bg-accent text-accent-foreground"
                  )}
                  onClick={() => {
                    console.log(
                      "Equipment clicked directly:",
                      equipment.id,
                      equipment.name
                    );
                    handleEquipmentSelect(equipment.id);
                  }}
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
