import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FoursquarePlace } from '@/lib/foursquare';
import { Location } from '@/lib/location';
import { MapPin, Star, Clock } from 'lucide-react';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom user location icon
const userLocationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiMzYjgyZjYiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjMiIGZpbGw9IiNmZmZmZmYiLz4KPC9zdmc+',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

// Custom place marker icon
const createPlaceIcon = (category?: string) => {
  const color = getMarkerColor(category);
  return new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${color}" stroke="#ffffff" stroke-width="2"/>
        <circle cx="12" cy="9" r="2.5" fill="#ffffff"/>
      </svg>
    `)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const getMarkerColor = (category?: string): string => {
  const categoryColors: Record<string, string> = {
    restaurant: '#f59e0b',
    food: '#f59e0b',
    shop: '#8b5cf6',
    retail: '#8b5cf6',
    hotel: '#06b6d4',
    travel: '#06b6d4',
    entertainment: '#f97316',
    health: '#10b981',
    automotive: '#ef4444',
    transport: '#ef4444',
    default: '#6b7280',
  };

  if (!category) return categoryColors.default;
  
  const lowerCategory = category.toLowerCase();
  for (const [key, color] of Object.entries(categoryColors)) {
    if (lowerCategory.includes(key)) {
      return color;
    }
  }
  
  return categoryColors.default;
};

// Component to update map view when location changes
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
};

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
  height = '400px',
  onPlaceClick,
}) => {
  const mapRef = useRef<L.Map>(null);

  const formatDistance = (distance?: number): string => {
    if (!distance) return '';
    if (distance < 1000) return `${Math.round(distance)}m`;
    return `${(distance / 1000).toFixed(1)}km`;
  };

  return (
    <div className="w-full" style={{ height }}>
      <MapContainer
        center={[center.latitude, center.longitude]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        className="rounded-lg shadow-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController center={[center.latitude, center.longitude]} zoom={zoom} />
        
        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={userLocationIcon}
          >
            <Popup>
              <div className="text-center">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-semibold text-blue-600">Your Location</span>
                </div>
                <div className="text-sm text-gray-600">
                  {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Place markers */}
        {places.map((place) => (
          <Marker
            key={place.fsq_id}
            position={[place.geocodes.main.latitude, place.geocodes.main.longitude]}
            icon={createPlaceIcon(place.categories[0]?.name)}
            eventHandlers={{
              click: () => onPlaceClick?.(place),
            }}
          >
            <Popup>
              <div className="min-w-[200px] max-w-[300px]">
                <div className="flex items-start space-x-3">
                  {place.categories[0] && (
                    <img
                      src={`${place.categories[0].icon.prefix}64${place.categories[0].icon.suffix}`}
                      alt={place.categories[0].name}
                      className="w-8 h-8 rounded-lg flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-base mb-1">
                      {place.name}
                    </h3>
                    
                    {place.categories[0] && (
                      <div className="flex items-center space-x-1 mb-2">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {place.categories[0].short_name || place.categories[0].name}
                        </span>
                      </div>
                    )}
                    
                    {place.location.formatted_address && (
                      <p className="text-sm text-gray-600 mb-2">
                        {place.location.formatted_address}
                      </p>
                    )}
                    
                    {place.distance && (
                      <div className="flex items-center space-x-1 text-xs text-green-600">
                        <MapPin className="w-3 h-3" />
                        <span>{formatDistance(place.distance)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;
