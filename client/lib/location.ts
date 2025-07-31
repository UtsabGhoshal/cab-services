// Location service for handling geolocation

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface LocationError {
  code: number;
  message: string;
}

export type LocationCallback = (location: Location) => void;
export type LocationErrorCallback = (error: LocationError) => void;

class LocationService {
  private watchId: number | null = null;
  private lastKnownLocation: Location | null = null;

  // Default location (New Delhi, India) as fallback
  private defaultLocation: Location = {
    latitude: 28.6139,
    longitude: 77.2090,
  };

  async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject({
          code: 0,
          message: 'Geolocation is not supported by this browser.',
        });
        return;
      }

      // Check if we have a recent cached location (within 5 minutes)
      if (this.lastKnownLocation && this.lastKnownLocation.timestamp) {
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        if (this.lastKnownLocation.timestamp > fiveMinutesAgo) {
          resolve(this.lastKnownLocation);
          return;
        }
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now(),
          };
          this.lastKnownLocation = location;
          resolve(location);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Return default location if geolocation fails
          resolve(this.defaultLocation);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }

  async requestPermission(): Promise<boolean> {
    if (!navigator.geolocation) {
      return false;
    }

    if ('permissions' in navigator) {
      try {
        const permission = await (navigator as any).permissions.query({ name: 'geolocation' });
        return permission.state === 'granted';
      } catch (error) {
        console.warn('Permission query failed:', error);
      }
    }

    // Fallback: try to get location directly
    try {
      await this.getCurrentLocation();
      return true;
    } catch (error) {
      return false;
    }
  }

  watchLocation(
    onLocationUpdate: LocationCallback,
    onError?: LocationErrorCallback
  ): number | null {
    if (!navigator.geolocation) {
      onError?.({
        code: 0,
        message: 'Geolocation is not supported by this browser.',
      });
      return null;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
        };
        this.lastKnownLocation = location;
        onLocationUpdate(location);
      },
      (error) => {
        const locationError: LocationError = {
          code: error.code,
          message: error.message,
        };
        onError?.(locationError);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000, // 1 minute
      }
    );

    return this.watchId;
  }

  stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  getLastKnownLocation(): Location | null {
    return this.lastKnownLocation;
  }

  getDefaultLocation(): Location {
    return this.defaultLocation;
  }

  // Calculate distance between two locations
  calculateDistance(from: Location, to: Location): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(to.latitude - from.latitude);
    const dLon = this.toRadians(to.longitude - from.longitude);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(from.latitude)) * Math.cos(this.toRadians(to.latitude)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Format location for display
  formatCoordinates(location: Location): string {
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  }

  // Check if location services are available
  isGeolocationAvailable(): boolean {
    return 'geolocation' in navigator;
  }
}

export const locationService = new LocationService();
