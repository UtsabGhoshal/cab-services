import { supabase } from "@/supabase/config";
import { supabaseDriverService } from "./supabaseDriverService";

export interface RideRequest {
  id?: string;
  pickupLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  destination: {
    lat: number;
    lng: number;
    address: string;
  };
  passengerName: string;
  passengerPhone: string;
  rideType: string;
  estimatedFare: number;
  distance: number;
  estimatedTime: number;
  createdAt?: Date;
}

export interface Driver {
  id: string;
  fullName: string;
  phoneNumber: string;
  vehicleInfo: any;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  status: string;
  isActive: boolean;
  isApproved: boolean;
  rating: number;
}

class DriverMatchingService {
  // Calculate distance between two points using Haversine formula
  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Find available drivers near pickup location
  async findNearbyDrivers(
    pickupLocation: { lat: number; lng: number },
    radiusKm: number = 10
  ): Promise<Driver[]> {
    try {
      // Get all active and approved drivers
      const drivers = await supabaseDriverService.getAllDrivers();
      
      // Filter for online, active, approved drivers with location
      const availableDrivers = drivers.filter(driver => 
        driver.isActive && 
        driver.isApproved && 
        driver.status === 'online' &&
        driver.currentLocation
      );

      // Calculate distances and filter by radius
      const nearbyDrivers = availableDrivers
        .map(driver => ({
          ...driver,
          distance: this.calculateDistance(
            pickupLocation.lat,
            pickupLocation.lng,
            driver.currentLocation!.lat,
            driver.currentLocation!.lng
          )
        }))
        .filter(driver => driver.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance); // Sort by distance

      return nearbyDrivers;
    } catch (error) {
      console.error('Error finding nearby drivers:', error);
      return [];
    }
  }

  // Create a ride request in Supabase
  async createRideRequest(rideData: RideRequest): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('rides')
        .insert({
          pickup_location: rideData.pickupLocation,
          destination: rideData.destination,
          passenger_name: rideData.passengerName,
          passenger_phone: rideData.passengerPhone,
          ride_type: rideData.rideType,
          fare: rideData.estimatedFare,
          distance_km: rideData.distance,
          duration_minutes: rideData.estimatedTime,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating ride request:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('Error creating ride request:', error);
      return null;
    }
  }

  // Match a ride with the best available driver
  async matchRideWithDriver(rideRequest: RideRequest): Promise<{
    success: boolean;
    rideId?: string;
    matchedDriver?: Driver;
    message: string;
  }> {
    try {
      // Find nearby drivers
      const nearbyDrivers = await this.findNearbyDrivers(
        rideRequest.pickupLocation,
        15 // 15km radius
      );

      if (nearbyDrivers.length === 0) {
        return {
          success: false,
          message: 'No drivers available in your area at the moment. Please try again later.',
        };
      }

      // Create the ride request first
      const rideId = await this.createRideRequest(rideRequest);
      if (!rideId) {
        return {
          success: false,
          message: 'Failed to create ride request. Please try again.',
        };
      }

      // For now, we'll just notify the nearest driver
      // In a real app, you might implement a bidding system or automatic assignment
      const nearestDriver = nearbyDrivers[0];

      // Notify the driver (in a real app, this would send a push notification)
      console.log(`🚗 Ride request ${rideId} sent to driver ${nearestDriver.fullName}`);

      return {
        success: true,
        rideId,
        matchedDriver: nearestDriver,
        message: `Found ${nearbyDrivers.length} nearby driver(s). Your ride request has been sent to the nearest driver.`,
      };
    } catch (error) {
      console.error('Error matching ride with driver:', error);
      return {
        success: false,
        message: 'Failed to process your ride request. Please try again.',
      };
    }
  }

  // Get ride status
  async getRideStatus(rideId: string) {
    try {
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .eq('id', rideId)
        .single();

      if (error) {
        console.error('Error fetching ride status:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching ride status:', error);
      return null;
    }
  }

  // Cancel a ride request
  async cancelRideRequest(rideId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('rides')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', rideId)
        .eq('status', 'pending'); // Only cancel if still pending

      if (error) {
        console.error('Error cancelling ride:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error cancelling ride:', error);
      return false;
    }
  }
}

export const driverMatchingService = new DriverMatchingService();
