import React, { useState, useEffect } from 'react';
import { BookingLocation } from '@shared/maps';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Navigation, AlertCircle } from 'lucide-react';

interface SimpleFallbackMapProps {
  onLocationSelect: (location: BookingLocation, isPickup: boolean) => void;
  pickup?: BookingLocation;
  destination?: BookingLocation;
  locationMode: "pickup" | "destination";
}

export const SimpleFallbackMap: React.FC<SimpleFallbackMapProps> = ({
  onLocationSelect,
  pickup,
  destination,
  locationMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BookingLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Fallback to Delhi
          setUserLocation({ lat: 28.6139, lng: 77.2090 });
        }
      );
    } else {
      // Fallback to Delhi
      setUserLocation({ lat: 28.6139, lng: 77.2090 });
    }
  }, []);

  // Search for locations using Nominatim
  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=8&countrycodes=in`
      );
      const data = await response.json();
      
      const results: BookingLocation[] = data.map((item: any) => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        address: item.display_name,
      }));
      
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchResultClick = (location: BookingLocation) => {
    onLocationSelect(location, locationMode === "pickup");
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleUseCurrentLocation = () => {
    if (userLocation) {
      // Reverse geocode current location
      fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${userLocation.lat}&lon=${userLocation.lng}&format=json`
      )
        .then(response => response.json())
        .then(data => {
          const location: BookingLocation = {
            lat: userLocation.lat,
            lng: userLocation.lng,
            address: data.display_name || `${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`,
          };
          onLocationSelect(location, locationMode === "pickup");
        })
        .catch(error => {
          console.error('Reverse geocoding error:', error);
          const location: BookingLocation = {
            lat: userLocation.lat,
            lng: userLocation.lng,
            address: `${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`,
          };
          onLocationSelect(location, locationMode === "pickup");
        });
    }
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
          Search for {locationMode === "pickup" ? "pickup" : "destination"} location
        </Label>
        <div className="relative mt-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="location-search"
            type="text"
            placeholder="Search for places in India..."
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

      {/* Current Location Button */}
      <Button
        onClick={handleUseCurrentLocation}
        variant="outline"
        className="w-full"
        disabled={!userLocation}
      >
        <Navigation className="w-4 h-4 mr-2" />
        Use Current Location
      </Button>

      {/* Map Placeholder with Instructions */}
      <div className="h-64 w-full rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center p-6">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Location Selection Available
          </h3>
          <p className="text-sm text-gray-600 max-w-sm">
            Use the search bar above to find specific places, or click "Use Current Location" 
            to set your current position as the {locationMode === "pickup" ? "pickup" : "destination"} point.
          </p>
        </div>
      </div>

      {/* Current Selection Display */}
      {(pickup || destination) && (
        <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg space-y-2">
          <h4 className="font-medium text-gray-800">Selected Locations:</h4>
          {pickup && (
            <div className="flex items-start space-x-2">
              <span className="font-medium text-blue-600 flex-shrink-0">Pickup:</span>
              <span className="text-xs leading-relaxed">{pickup.address}</span>
            </div>
          )}
          {destination && (
            <div className="flex items-start space-x-2">
              <span className="font-medium text-red-600 flex-shrink-0">Destination:</span>
              <span className="text-xs leading-relaxed">{destination.address}</span>
            </div>
          )}
        </div>
      )}

      {/* Quick Location Suggestions */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => handleSearchResultClick({
            lat: 28.6139,
            lng: 77.2090,
            address: "Connaught Place, New Delhi, India"
          })}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          Connaught Place
        </Button>
        <Button
          onClick={() => handleSearchResultClick({
            lat: 28.5562,
            lng: 77.1000,
            address: "IGI Airport, New Delhi, India"
          })}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          IGI Airport
        </Button>
        <Button
          onClick={() => handleSearchResultClick({
            lat: 28.6508,
            lng: 77.2311,
            address: "India Gate, New Delhi, India"
          })}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          India Gate
        </Button>
        <Button
          onClick={() => handleSearchResultClick({
            lat: 28.6692,
            lng: 77.4538,
            address: "Ghaziabad, Uttar Pradesh, India"
          })}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          Ghaziabad
        </Button>
      </div>
    </div>
  );
};

export default SimpleFallbackMap;
