import React from 'react';
import { FoursquarePlace } from '@/lib/foursquare';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Star, 
  Clock, 
  ExternalLink, 
  Navigation,
  Phone,
  Globe,
} from 'lucide-react';

interface PlaceCardProps {
  place: FoursquarePlace;
  onSelect?: (place: FoursquarePlace) => void;
  onGetDirections?: (place: FoursquarePlace) => void;
  showActions?: boolean;
  compact?: boolean;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  onSelect,
  onGetDirections,
  showActions = true,
  compact = false,
}) => {
  const formatDistance = (distance?: number): string => {
    if (!distance) return '';
    if (distance < 1000) return `${Math.round(distance)}m away`;
    return `${(distance / 1000).toFixed(1)}km away`;
  };

  const getCategoryIcon = (category: FoursquarePlace['categories'][0]) => {
    if (category?.icon) {
      return `${category.icon.prefix}64${category.icon.suffix}`;
    }
    return null;
  };

  const primaryCategory = place.categories[0];
  const categoryIcon = primaryCategory ? getCategoryIcon(primaryCategory) : null;

  if (compact) {
    return (
      <Card 
        className="hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 border-l-yellow-500"
        onClick={() => onSelect?.(place)}
      >
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            {categoryIcon && (
              <img
                src={categoryIcon}
                alt={primaryCategory?.name}
                className="w-8 h-8 rounded-lg flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {place.name}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                {primaryCategory && (
                  <Badge variant="secondary" className="text-xs">
                    {primaryCategory.short_name || primaryCategory.name}
                  </Badge>
                )}
                {place.distance && (
                  <span className="text-xs text-green-600 flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {formatDistance(place.distance)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Category Icon */}
          <div className="flex-shrink-0">
            {categoryIcon ? (
              <img
                src={categoryIcon}
                alt={primaryCategory?.name}
                className="w-12 h-12 rounded-xl shadow-sm group-hover:scale-105 transition-transform"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
            )}
          </div>

          {/* Place Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-yellow-600 transition-colors">
                {place.name}
              </h3>
              {place.distance && (
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <MapPin className="w-4 h-4 mr-1" />
                  {formatDistance(place.distance)}
                </div>
              )}
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-3">
              {place.categories.slice(0, 3).map((category, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                >
                  {category.short_name || category.name}
                </Badge>
              ))}
            </div>

            {/* Address */}
            {place.location.formatted_address && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {place.location.formatted_address}
              </p>
            )}

            {/* Chain Info */}
            {place.chains && place.chains.length > 0 && (
              <div className="flex items-center text-sm text-blue-600 mb-3">
                <Globe className="w-4 h-4 mr-1" />
                <span className="font-medium">{place.chains[0].name}</span>
              </div>
            )}

            {/* Coordinates */}
            <div className="text-xs text-gray-500 mb-4">
              {place.geocodes.main.latitude.toFixed(6)}, {place.geocodes.main.longitude.toFixed(6)}
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => onSelect?.(place)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  Select Place
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onGetDirections?.(place)}
                  className="border-green-300 text-green-600 hover:bg-green-50"
                >
                  <Navigation className="w-4 h-4 mr-1" />
                  Directions
                </Button>

                {place.link && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(place.link, '_blank')}
                    className="text-blue-600 hover:bg-blue-50"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface PlacesListProps {
  places: FoursquarePlace[];
  loading?: boolean;
  error?: string | null;
  onPlaceSelect?: (place: FoursquarePlace) => void;
  onGetDirections?: (place: FoursquarePlace) => void;
  compact?: boolean;
  maxHeight?: string;
}

export const PlacesList: React.FC<PlacesListProps> = ({
  places,
  loading = false,
  error = null,
  onPlaceSelect,
  onGetDirections,
  compact = false,
  maxHeight = '600px',
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <div className="text-red-600 mb-2">
            <MapPin className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">Unable to load places</p>
          </div>
          <p className="text-sm text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (places.length === 0) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-8 text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No places found</h3>
          <p className="text-gray-500">
            Try adjusting your search criteria or location.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div 
      className="space-y-4 overflow-y-auto"
      style={{ maxHeight }}
    >
      <div className="text-sm text-gray-600 font-medium">
        Found {places.length} places nearby
      </div>
      {places.map((place) => (
        <PlaceCard
          key={place.fsq_id}
          place={place}
          onSelect={onPlaceSelect}
          onGetDirections={onGetDirections}
          compact={compact}
        />
      ))}
    </div>
  );
};

export default PlaceCard;
