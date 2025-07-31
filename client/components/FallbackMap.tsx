import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { BookingLocation } from "@shared/maps";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Search } from "lucide-react";

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icons for pickup and destination
const pickupIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDOC4xMyAyIDUgNS4xMyA1IDljMCA1LjI1IDcgMTMgNyAxM3M3LTcuNzUgNy0xM2MwLTMuODctMy4xMy03LTctN3oiIGZpbGw9IiMzYjgyZjYiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iOSIgcj0iMi41IiBmaWxsPSIjZmZmZmZmIi8+Cjwvc3ZnPg==",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const destinationIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDOC4xMyAyIDUgNS4xMyA1IDljMCA1LjI1IDcgMTMgNyAxM3M3LTcuNzUgNy0xM2MwLTMuODctMy4xMy03LTctN3oiIGZpbGw9IiNlZjQ0NDQiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iOSIgcj0iMi41IiBmaWxsPSIjZmZmZmZmIi8+Cjwvc3ZnPg==",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface FallbackMapProps {
  onLocationSelect: (location: BookingLocation, isPickup: boolean) => void;
  pickup?: BookingLocation;
  destination?: BookingLocation;
  locationMode: "pickup" | "destination";
}

// Map click handler component
const MapClickHandler: React.FC<{
  onLocationSelect: (location: BookingLocation, isPickup: boolean) => void;
  locationMode: "pickup" | "destination";
}> = ({ onLocationSelect, locationMode }) => {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;

      // Use reverse geocoding with Nominatim (OpenStreetMap's geocoding service)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        );
        const data = await response.json();

        const location: BookingLocation = {
          lat,
          lng,
          address: data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        };

        onLocationSelect(location, locationMode === "pickup");
      } catch (error) {
        console.error("Geocoding error:", error);
        // Fallback to coordinates
        const location: BookingLocation = {
          lat,
          lng,
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        };
        onLocationSelect(location, locationMode === "pickup");
      }
    },
  });

  return null;
};

export const FallbackMap: React.FC<FallbackMapProps> = ({
  onLocationSelect,
  pickup,
  destination,
  locationMode,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<BookingLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Search for locations using Nominatim
  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=in`,
      );
      const data = await response.json();

      const results: BookingLocation[] = data.map((item: any) => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        address: item.display_name,
      }));

      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchResultClick = (location: BookingLocation) => {
    onLocationSelect(location, locationMode === "pickup");
    setSearchResults([]);
    setSearchQuery("");
  };

  // Calculate center point between pickup and destination, or use default
  const getMapCenter = (): [number, number] => {
    if (pickup && destination) {
      return [
        (pickup.lat + destination.lat) / 2,
        (pickup.lng + destination.lng) / 2,
      ];
    }
    if (pickup) return [pickup.lat, pickup.lng];
    if (destination) return [destination.lat, destination.lng];
    return [28.6139, 77.209]; // New Delhi default
  };

  const getMapZoom = (): number => {
    if (pickup && destination) {
      // Calculate zoom based on distance between points
      const latDiff = Math.abs(pickup.lat - destination.lat);
      const lngDiff = Math.abs(pickup.lng - destination.lng);
      const maxDiff = Math.max(latDiff, lngDiff);

      if (maxDiff > 0.5) return 9;
      if (maxDiff > 0.1) return 11;
      if (maxDiff > 0.05) return 12;
      return 13;
    }
    return 12;
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchLocation(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Label htmlFor="location-search">
          Search for {locationMode === "pickup" ? "pickup" : "destination"}{" "}
          location
        </Label>
        <div className="relative mt-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="location-search"
            type="text"
            placeholder="Search for places..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((result, index) => (
              <button
                key={index}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                onClick={() => handleSearchResultClick(result)}
              >
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 line-clamp-2">
                    {result.address}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {isSearching && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 text-center">
            <span className="text-sm text-gray-500">Searching...</span>
          </div>
        )}
      </div>

      {/* Map Instructions */}
      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <p>
          <strong>How to use:</strong> Click on the map to set your{" "}
          {locationMode === "pickup" ? "pickup" : "destination"} location, or
          search for a place using the search bar above.
        </p>
      </div>

      {/* Map */}
      <div className="h-80 w-full rounded-lg overflow-hidden border border-gray-200">
        <MapContainer
          center={getMapCenter()}
          zoom={getMapZoom()}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler
            onLocationSelect={onLocationSelect}
            locationMode={locationMode}
          />

          {/* Pickup Marker */}
          {pickup && (
            <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} />
          )}

          {/* Destination Marker */}
          {destination && (
            <Marker
              position={[destination.lat, destination.lng]}
              icon={destinationIcon}
            />
          )}
        </MapContainer>
      </div>

      {/* Current Selection Display */}
      {(pickup || destination) && (
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          {pickup && (
            <div className="flex items-start space-x-2 mb-2">
              <span className="font-medium text-blue-600">Pickup:</span>
              <span>{pickup.address}</span>
            </div>
          )}
          {destination && (
            <div className="flex items-start space-x-2">
              <span className="font-medium text-red-600">Destination:</span>
              <span>{destination.address}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FallbackMap;
