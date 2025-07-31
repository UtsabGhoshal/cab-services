import { useState, useEffect, useCallback, useRef } from 'react';
import { createDriverService, DriverService, RideRequest, OngoingRide, DriverLocation } from '@/services/driverService';
import { initializeFirebaseCollections } from '@/utils/firebaseInit';

interface UseDriverServiceOptions {
  driverId: string;
  autoStart?: boolean;
}

interface UseDriverServiceReturn {
  // Status
  isOnline: boolean;
  isConnected: boolean;
  lastUpdate: Date | null;
  
  // Data
  rideRequests: RideRequest[];
  ongoingRides: OngoingRide[];
  rideHistory: any[];
  
  // Actions
  toggleOnlineStatus: (location?: DriverLocation) => Promise<void>;
  acceptRide: (requestId: string) => Promise<void>;
  rejectRide: (requestId: string) => Promise<void>;
  updateRideStatus: (rideId: string, status: OngoingRide['status']) => Promise<void>;
  completeRide: (rideId: string, finalEarnings: number) => Promise<void>;
  updateLocation: (location: DriverLocation) => Promise<void>;
  
  // Loading states
  loading: {
    toggleStatus: boolean;
    acceptRide: boolean;
    rejectRide: boolean;
    updateStatus: boolean;
    completeRide: boolean;
  };
  
  // Errors
  error: string | null;
}

export const useDriverService = ({ 
  driverId, 
  autoStart = true 
}: UseDriverServiceOptions): UseDriverServiceReturn => {
  const [isOnline, setIsOnline] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([]);
  const [ongoingRides, setOngoingRides] = useState<OngoingRide[]>([]);
  const [rideHistory, setRideHistory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [loading, setLoading] = useState({
    toggleStatus: false,
    acceptRide: false,
    rejectRide: false,
    updateStatus: false,
    completeRide: false,
  });

  const driverService = useRef<DriverService | null>(null);
  const currentLocation = useRef<DriverLocation | null>(null);

  // Initialize driver service
  useEffect(() => {
    if (driverId) {
      driverService.current = createDriverService(driverId);
      setIsConnected(true);
      
      if (autoStart) {
        startListening();
      }
    }

    return () => {
      if (driverService.current) {
        driverService.current.cleanup();
      }
    };
  }, [driverId, autoStart]);

  // Get current location
  const getCurrentLocation = useCallback((): Promise<DriverLocation> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: DriverLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: new Date(),
          };
          currentLocation.current = location;
          resolve(location);
        },
        (error) => {
          // Fallback to Delhi location
          const fallbackLocation: DriverLocation = {
            lat: 28.6139,
            lng: 77.209,
            timestamp: new Date(),
          };
          currentLocation.current = fallbackLocation;
          resolve(fallbackLocation);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000, // 1 minute
        }
      );
    });
  }, []);

  // Start listening to Firebase updates
  const startListening = useCallback(async () => {
    if (!driverService.current) return;

    try {
      // Get current location
      const location = await getCurrentLocation();

      // Subscribe to ongoing rides with error handling
      try {
        driverService.current.subscribeToOngoingRides((rides) => {
          setOngoingRides(rides);
          setLastUpdate(new Date());
        });
      } catch (err) {
        console.warn('Error subscribing to ongoing rides:', err);
      }

      // Subscribe to ride history with error handling
      try {
        driverService.current.subscribeToRideHistory(50, (history) => {
          setRideHistory(history);
          setLastUpdate(new Date());
        });
      } catch (err) {
        console.warn('Error subscribing to ride history:', err);
      }

      // Subscribe to ride requests if online
      if (isOnline && location) {
        try {
          driverService.current.subscribeToRideRequests(
            location,
            10, // 10km radius
            (requests) => {
              setRideRequests(requests);
              setLastUpdate(new Date());
            }
          );
        } catch (err) {
          console.warn('Error subscribing to ride requests:', err);
        }
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start listening');
    }
  }, [isOnline, getCurrentLocation]);

  // Toggle online status
  const toggleOnlineStatus = useCallback(async (location?: DriverLocation) => {
    if (!driverService.current) return;

    setLoading(prev => ({ ...prev, toggleStatus: true }));
    try {
      const newStatus = !isOnline;
      const driverLocation = location || await getCurrentLocation();
      
      await driverService.current.updateOnlineStatus(newStatus, driverLocation);
      setIsOnline(newStatus);
      
      if (newStatus) {
        // Start listening to ride requests when going online
        driverService.current.subscribeToRideRequests(
          driverLocation,
          10, // 10km radius
          (requests) => {
            setRideRequests(requests);
            setLastUpdate(new Date());
          }
        );
      } else {
        // Clear ride requests when going offline
        setRideRequests([]);
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setLoading(prev => ({ ...prev, toggleStatus: false }));
    }
  }, [isOnline, getCurrentLocation]);

  // Accept ride request
  const acceptRide = useCallback(async (requestId: string) => {
    if (!driverService.current) return;

    setLoading(prev => ({ ...prev, acceptRide: true }));
    try {
      await driverService.current.acceptRideRequest(requestId);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept ride');
    } finally {
      setLoading(prev => ({ ...prev, acceptRide: false }));
    }
  }, []);

  // Reject ride request
  const rejectRide = useCallback(async (requestId: string) => {
    if (!driverService.current) return;

    setLoading(prev => ({ ...prev, rejectRide: true }));
    try {
      await driverService.current.rejectRideRequest(requestId);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject ride');
    } finally {
      setLoading(prev => ({ ...prev, rejectRide: false }));
    }
  }, []);

  // Update ride status
  const updateRideStatus = useCallback(async (rideId: string, status: OngoingRide['status']) => {
    if (!driverService.current) return;

    setLoading(prev => ({ ...prev, updateStatus: true }));
    try {
      await driverService.current.updateRideStatus(rideId, status);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ride status');
    } finally {
      setLoading(prev => ({ ...prev, updateStatus: false }));
    }
  }, []);

  // Complete ride
  const completeRide = useCallback(async (rideId: string, finalEarnings: number) => {
    if (!driverService.current) return;

    setLoading(prev => ({ ...prev, completeRide: true }));
    try {
      await driverService.current.completeRide(rideId, finalEarnings);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete ride');
    } finally {
      setLoading(prev => ({ ...prev, completeRide: false }));
    }
  }, []);

  // Update location
  const updateLocation = useCallback(async (location: DriverLocation) => {
    if (!driverService.current) return;

    try {
      await driverService.current.updateLocation(location);
      currentLocation.current = location;
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update location');
    }
  }, []);

  // Auto-update location when online
  useEffect(() => {
    if (!isOnline) return;

    const updateInterval = setInterval(async () => {
      try {
        const location = await getCurrentLocation();
        await updateLocation(location);
      } catch (err) {
        console.warn('Failed to update location:', err);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(updateInterval);
  }, [isOnline, getCurrentLocation, updateLocation]);

  return {
    // Status
    isOnline,
    isConnected,
    lastUpdate,
    
    // Data
    rideRequests,
    ongoingRides,
    rideHistory,
    
    // Actions
    toggleOnlineStatus,
    acceptRide,
    rejectRide,
    updateRideStatus,
    completeRide,
    updateLocation,
    
    // Loading states
    loading,
    
    // Errors
    error,
  };
};
