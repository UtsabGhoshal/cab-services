import React from "react";
import { FoursquarePlace } from "@/lib/foursquare";
import { Location } from "@/lib/location";
import { MapPin, Star, Clock } from "lucide-react";

interface MapProps {
  center: Location;
  places: FoursquarePlace[];
  userLocation?: Location;
  zoom?: number;
  height?: string;
  onPlaceClick?: (place: FoursquarePlace) => void;
}

const Map: React.FC<MapProps> = ({
  center,
  places,
  userLocation,
  zoom = 13,
  height = "400px",
  onPlaceClick,
}) => {
  const formatDistance = (distance?: number): string => {
    if (!distance) return "";
    if (distance < 1000) return `${Math.round(distance)}m`;
    return `${(distance / 1000).toFixed(1)}km`;
  };

  return (
    <div className="w-full relative" style={{ height }}>
      {/* Map placeholder with gradient background */}
      <div className="w-full h-full rounded-lg shadow-lg bg-gradient-to-br from-blue-100 via-green-50 to-blue-50 border border-gray-200 relative overflow-hidden">
        {/* Map overlay with location info */}
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="text-center p-6 max-w-md">
            <MapPin className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Interactive Map
            </h3>
            <p className="text-gray-600 mb-4">
              {places.length > 0
                ? `Found ${places.length} places near your location`
                : "Searching for places in your area..."}
            </p>

            {userLocation && (
              <div className="text-sm text-gray-500 mb-4">
                <strong>Your Location:</strong>
                <br />
                {userLocation.latitude.toFixed(4)},{" "}
                {userLocation.longitude.toFixed(4)}
              </div>
            )}

            {/* Places summary */}
            {places.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Nearby Places:
                </p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {places.slice(0, 5).map((place, index) => (
                    <div
                      key={place.fsq_id}
                      className="text-xs bg-white rounded p-2 border cursor-pointer hover:bg-blue-50 transition-colors"
                      onClick={() => onPlaceClick?.(place)}
                    >
                      <div className="font-medium text-gray-800">
                        {place.name}
                      </div>
                      {place.distance && (
                        <div className="text-green-600">
                          {formatDistance(place.distance)} away
                        </div>
                      )}
                    </div>
                  ))}
                  {places.length > 5 && (
                    <div className="text-xs text-gray-500">
                      ... and {places.length - 5} more places
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Decorative map-like grid */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
              backgroundSize: "40px 40px",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Map;
