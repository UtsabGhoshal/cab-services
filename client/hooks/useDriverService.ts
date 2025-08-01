import { useState, useEffect, useCallback, useRef } from "react";
import { driverService } from "@/services/driverService";

export const useDriverService = ({ driverId, autoStart = true }) => {
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyRides, setNearbyRides] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalRides: 0,
    averageRating: 5.0,
    hoursOnline: 0,
    completionRate: 100
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locationWatchId = useRef<number | null>(null);
  const ridesSubscription = useRef<(() => void) | null>(null);

  // Initialize service
  useEffect(() => {
    if (autoStart && driverId) {
      initializeService();
    }
    
    return () => {
      cleanup();
    };
  }, [driverId, autoStart]);

  const initializeService = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load driver stats
      if (driverId) {
        const driverStats = await driverService.getDriverStats(driverId);
        setStats(driverStats);
      }

      console.log("✅ Driver service initialized");
    } catch (err) {
      console.error("❌ Failed to initialize driver service:", err);
      setError("Failed to initialize driver service");
    } finally {
      setIsLoading(false);
    }
  }, [driverId]);

  const startLocationTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return;
    }

    const watchOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // 1 minute
    };

    locationWatchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setLocation(newLocation);

        // Update driver location in database
        if (driverId && isOnline) {
          driverService.updateDriverLocation(driverId, {
            ...newLocation,
            timestamp: new Date()
          }).catch(err => {
            console.warn("Failed to update driver location:", err);
          });
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setError("Failed to get location");
      },
      watchOptions
    );
  }, [driverId, isOnline]);

  const stopLocationTracking = useCallback(() => {
    if (locationWatchId.current !== null) {
      navigator.geolocation.clearWatch(locationWatchId.current);
      locationWatchId.current = null;
    }
  }, []);

  const goOnline = useCallback(async () => {
    try {
      setIsOnline(true);
      startLocationTracking();

      // Subscribe to ride requests
      if (driverId) {
        ridesSubscription.current = driverService.subscribeToDriverRides(
          driverId,
          (rides) => {
            setNearbyRides(rides);
          }
        );
      }

      console.log("🟢 Driver is now online");
    } catch (err) {
      console.error("Failed to go online:", err);
      setError("Failed to go online");
      setIsOnline(false);
    }
  }, [driverId, startLocationTracking]);

  const goOffline = useCallback(async () => {
    try {
      setIsOnline(false);
      stopLocationTracking();

      // Unsubscribe from ride requests
      if (ridesSubscription.current) {
        ridesSubscription.current();
        ridesSubscription.current = null;
      }

      setNearbyRides([]);
      console.log("🔴 Driver is now offline");
    } catch (err) {
      console.error("Failed to go offline:", err);
      setError("Failed to go offline");
    }
  }, [stopLocationTracking]);

  const acceptRide = useCallback(async (rideId: string) => {
    try {
      if (!driverId) throw new Error("Driver ID not available");
      
      const success = await driverService.acceptRide(rideId, driverId);
      if (success) {
        // Update local state
        const acceptedRide = nearbyRides.find((ride: any) => ride.id === rideId);
        if (acceptedRide) {
          setActiveRide(acceptedRide);
          setNearbyRides(rides => rides.filter((ride: any) => ride.id !== rideId));
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to accept ride:", err);
      setError("Failed to accept ride");
      return false;
    }
  }, [driverId, nearbyRides]);

  const updateRideStatus = useCallback(async (rideId: string, status: string) => {
    try {
      const success = await driverService.updateRideStatus(rideId, status as any);
      if (success && status === 'completed') {
        setActiveRide(null);
        // Refresh stats
        if (driverId) {
          const updatedStats = await driverService.getDriverStats(driverId);
          setStats(updatedStats);
        }
      }
      return success;
    } catch (err) {
      console.error("Failed to update ride status:", err);
      setError("Failed to update ride status");
      return false;
    }
  }, [driverId]);

  const cleanup = useCallback(() => {
    stopLocationTracking();
    if (ridesSubscription.current) {
      ridesSubscription.current();
      ridesSubscription.current = null;
    }
  }, [stopLocationTracking]);

  const refreshNearbyRides = useCallback(async () => {
    if (!location || !isOnline) return;

    try {
      const rides = await driverService.getNearbyRides(
        { ...location, timestamp: new Date() },
        10 // 10km radius
      );
      setNearbyRides(rides);
    } catch (err) {
      console.warn("Failed to refresh nearby rides:", err);
    }
  }, [location, isOnline]);

  return {
    // State
    isOnline,
    location,
    nearbyRides,
    activeRide,
    stats,
    isLoading,
    error,

    // Actions
    goOnline,
    goOffline,
    acceptRide,
    updateRideStatus,
    refreshNearbyRides,
    initializeService,

    // Utilities
    clearError: () => setError(null),
  };
};
