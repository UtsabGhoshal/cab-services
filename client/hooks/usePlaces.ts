import { useState, useEffect, useCallback } from 'react';
import { foursquareService, FoursquarePlace } from '@/lib/foursquare';
import { locationService, Location } from '@/lib/location';

export interface UsePlacesOptions {
  radius?: number;
  limit?: number;
  query?: string;
  autoFetch?: boolean;
  categories?: string;
}

export interface UsePlacesReturn {
  places: FoursquarePlace[];
  loading: boolean;
  error: string | null;
  userLocation: Location | null;
  locationPermission: boolean | null;
  fetchPlaces: (location?: Location) => Promise<void>;
  refetch: () => Promise<void>;
  searchPlaces: (query: string) => Promise<void>;
  clearPlaces: () => void;
}

export const usePlaces = (options: UsePlacesOptions = {}): UsePlacesReturn => {
  const {
    radius = 2000,
    limit = 20,
    query = '',
    autoFetch = true,
    categories,
  } = options;

  const [places, setPlaces] = useState<FoursquarePlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [currentQuery, setCurrentQuery] = useState(query);

  // Request location permission and get user location
  const getUserLocation = useCallback(async (): Promise<Location | null> => {
    try {
      const hasPermission = await locationService.requestPermission();
      setLocationPermission(hasPermission);

      const location = await locationService.getCurrentLocation();
      setUserLocation(location);
      return location;
    } catch (err) {
      console.error('Error getting user location:', err);
      setError('Unable to get your location. Using default location.');
      
      // Use default location as fallback
      const defaultLocation = locationService.getDefaultLocation();
      setUserLocation(defaultLocation);
      return defaultLocation;
    }
  }, []);

  // Fetch places from Foursquare API
  const fetchPlaces = useCallback(async (location?: Location) => {
    setLoading(true);
    setError(null);

    try {
      const targetLocation = location || userLocation || await getUserLocation();
      if (!targetLocation) {
        throw new Error('No location available');
      }

      // Temporarily disable Foursquare API due to authentication issues
      // const fetchedPlaces = await foursquareService.getNearbyPlaces(
      //   targetLocation.latitude,
      //   targetLocation.longitude,
      //   radius,
      //   limit,
      //   currentQuery || undefined
      // );

      // Use mock data instead
      const fetchedPlaces: FoursquarePlace[] = [
        {
          fsq_id: 'mock-1',
          name: 'Central Park Restaurant',
          categories: [{
            id: 13065,
            name: 'Restaurant',
            short_name: 'Restaurant',
            plural_name: 'Restaurants',
            icon: { prefix: 'https://ss3.4sqi.net/img/categories_v2/food/default_', suffix: '.png' }
          }],
          location: {
            address: '123 Park Street',
            country: 'IN',
            formatted_address: '123 Park Street, New Delhi, India'
          },
          geocodes: {
            main: {
              latitude: targetLocation.latitude + 0.01,
              longitude: targetLocation.longitude + 0.01
            }
          }
        },
        {
          fsq_id: 'mock-2',
          name: 'Coffee Corner Cafe',
          categories: [{
            id: 16032,
            name: 'Coffee Shop',
            short_name: 'Coffee',
            plural_name: 'Coffee Shops',
            icon: { prefix: 'https://ss3.4sqi.net/img/categories_v2/food/coffeeshop_', suffix: '.png' }
          }],
          location: {
            address: '456 Main Road',
            country: 'IN',
            formatted_address: '456 Main Road, New Delhi, India'
          },
          geocodes: {
            main: {
              latitude: targetLocation.latitude - 0.005,
              longitude: targetLocation.longitude + 0.005
            }
          }
        }
      ];

      // Calculate distances and add to places
      const placesWithDistance = fetchedPlaces.map((place) => ({
        ...place,
        distance: foursquareService.calculateDistance(
          targetLocation.latitude,
          targetLocation.longitude,
          place.geocodes.main.latitude,
          place.geocodes.main.longitude
        ) * 1000, // Convert to meters
      }));

      setPlaces(placesWithDistance);
    } catch (err) {
      console.error('Error fetching places:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch places');
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  }, [userLocation, radius, limit, currentQuery, getUserLocation]);

  // Refetch places with current location
  const refetch = useCallback(async () => {
    await fetchPlaces();
  }, [fetchPlaces]);

  // Search places with a specific query
  const searchPlaces = useCallback(async (searchQuery: string) => {
    setCurrentQuery(searchQuery);
    await fetchPlaces();
  }, [fetchPlaces]);

  // Clear places
  const clearPlaces = useCallback(() => {
    setPlaces([]);
    setError(null);
  }, []);

  // Auto-fetch places when component mounts
  useEffect(() => {
    if (autoFetch) {
      getUserLocation().then((location) => {
        if (location) {
          fetchPlaces(location);
        }
      });
    }
  }, [autoFetch, getUserLocation, fetchPlaces]);

  // Re-fetch when query changes
  useEffect(() => {
    if (userLocation && currentQuery !== query) {
      setCurrentQuery(query);
      if (query !== '') {
        fetchPlaces();
      }
    }
  }, [query, userLocation, fetchPlaces]);

  return {
    places,
    loading,
    error,
    userLocation,
    locationPermission,
    fetchPlaces,
    refetch,
    searchPlaces,
    clearPlaces,
  };
};

// Hook for getting popular categories
export const usePopularCategories = () => {
  const categories = [
    { id: '13065', name: 'Restaurant', icon: '🍽️' },
    { id: '17069', name: 'Gas Station', icon: '⛽' },
    { id: '19014', name: 'Hotel', icon: '🏨' },
    { id: '16032', name: 'Coffee Shop', icon: '☕' },
    { id: '17043', name: 'Grocery Store', icon: '🛒' },
    { id: '15010', name: 'Hospital', icon: '🏥' },
    { id: '16003', name: 'Bank', icon: '🏦' },
    { id: '10032', name: 'Shopping Mall', icon: '🛍️' },
  ];

  return categories;
};

// Hook for location watching
export const useLocationWatcher = () => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [watching, setWatching] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  const startWatching = useCallback(() => {
    if (watching) return;

    const id = locationService.watchLocation(
      (location) => {
        setCurrentLocation(location);
      },
      (error) => {
        console.error('Location watch error:', error);
      }
    );

    if (id) {
      setWatchId(id);
      setWatching(true);
    }
  }, [watching]);

  const stopWatching = useCallback(() => {
    if (watchId) {
      locationService.stopWatching();
      setWatchId(null);
      setWatching(false);
    }
  }, [watchId]);

  useEffect(() => {
    return () => {
      stopWatching();
    };
  }, [stopWatching]);

  return {
    currentLocation,
    watching,
    startWatching,
    stopWatching,
  };
};
