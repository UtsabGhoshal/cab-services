import { supabase } from "@/supabase/config";

// Types
export interface DriverLocation {
  lat: number;
  lng: number;
  timestamp: Date;
}

export interface RideRequest {
  id: string;
  passengerName: string;
  passengerPhone: string;
  pickup: {
    address: string;
    lat: number;
    lng: number;
  };
  destination: {
    address: string;
    lat: number;
    lng: number;
  };
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
  fare: number;
  estimatedTime: number;
  createdAt: Date;
}

export interface DriverStats {
  totalEarnings: number;
  totalRides: number;
  averageRating: number;
  hoursOnline: number;
  completionRate: number;
}

class DriverService {
  // Update driver location in Supabase
  async updateDriverLocation(
    driverId: string,
    location: DriverLocation,
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("drivers")
        .update({
          current_location: {
            lat: location.lat,
            lng: location.lng,
            timestamp: location.timestamp.toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", driverId);

      if (error) {
        console.error("Error updating driver location:", error);
        throw new Error("Failed to update location");
      }
    } catch (error) {
      console.error("Driver location update error:", error);
      throw error;
    }
  }

  // Get nearby ride requests
  async getNearbyRides(
    driverLocation: DriverLocation,
    radiusKm: number = 10,
  ): Promise<RideRequest[]> {
    try {
      // Note: For real implementation, you'd use PostGIS functions in Supabase for geo queries
      // This is a simplified version
      const { data, error } = await supabase
        .from("rides")
        .select("*")
        .eq("status", "pending")
        .limit(10);

      if (error) {
        console.error("Error fetching nearby rides:", error);
        return [];
      }

      // Transform Supabase data to RideRequest format
      return data.map((ride) => ({
        id: ride.id,
        passengerName: ride.passenger_name || "Unknown",
        passengerPhone: ride.passenger_phone || "",
        pickup: ride.pickup_location || { address: "", lat: 0, lng: 0 },
        destination: ride.destination || { address: "", lat: 0, lng: 0 },
        status: ride.status,
        fare: ride.fare || 0,
        estimatedTime: ride.duration_minutes || 0,
        createdAt: new Date(ride.created_at),
      }));
    } catch (error) {
      console.error("Error fetching nearby rides:", error);
      return [];
    }
  }

  // Accept a ride request
  async acceptRide(rideId: string, driverId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("rides")
        .update({
          driver_id: driverId,
          status: "accepted",
          updated_at: new Date().toISOString(),
        })
        .eq("id", rideId)
        .eq("status", "pending"); // Only accept if still pending

      if (error) {
        console.error("Error accepting ride:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Accept ride error:", error);
      return false;
    }
  }

  // Update ride status
  async updateRideStatus(
    rideId: string,
    status: RideRequest["status"],
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("rides")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", rideId);

      if (error) {
        console.error("Error updating ride status:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Update ride status error:", error);
      return false;
    }
  }

  // Get driver statistics
  async getDriverStats(driverId: string): Promise<DriverStats> {
    try {
      // Get completed rides count and total earnings
      const { data: completedRides, error: ridesError } = await supabase
        .from("rides")
        .select("fare")
        .eq("driver_id", driverId)
        .eq("status", "completed");

      if (ridesError) {
        console.error("Error fetching driver stats:", ridesError);
      }

      const totalRides = completedRides?.length || 0;
      const totalEarnings =
        completedRides?.reduce((sum, ride) => sum + (ride.fare || 0), 0) || 0;

      // Get driver info for rating and other stats
      const { data: driver, error: driverError } = await supabase
        .from("drivers")
        .select("rating, total_rides")
        .eq("id", driverId)
        .single();

      if (driverError) {
        console.error("Error fetching driver info:", driverError);
      }

      return {
        totalEarnings,
        totalRides: driver?.total_rides || totalRides,
        averageRating: driver?.rating || 5.0,
        hoursOnline: 0, // TODO: Calculate from driver activity logs
        completionRate: totalRides > 0 ? 100 : 0, // Simplified calculation
      };
    } catch (error) {
      console.error("Error getting driver stats:", error);
      return {
        totalEarnings: 0,
        totalRides: 0,
        averageRating: 5.0,
        hoursOnline: 0,
        completionRate: 0,
      };
    }
  }

  // Subscribe to ride updates for a driver
  subscribeToDriverRides(
    driverId: string,
    callback: (rides: RideRequest[]) => void,
  ) {
    const channel = supabase
      .channel("driver_rides")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rides",
          filter: `driver_id=eq.${driverId}`,
        },
        async () => {
          // Fetch updated rides when changes occur
          try {
            const { data, error } = await supabase
              .from("rides")
              .select("*")
              .eq("driver_id", driverId)
              .order("created_at", { ascending: false });

            if (!error && data) {
              const rides = data.map((ride) => ({
                id: ride.id,
                passengerName: ride.passenger_name || "Unknown",
                passengerPhone: ride.passenger_phone || "",
                pickup: ride.pickup_location || { address: "", lat: 0, lng: 0 },
                destination: ride.destination || {
                  address: "",
                  lat: 0,
                  lng: 0,
                },
                status: ride.status,
                fare: ride.fare || 0,
                estimatedTime: ride.duration_minutes || 0,
                createdAt: new Date(ride.created_at),
              }));
              callback(rides);
            }
          } catch (error) {
            console.error("Error in ride subscription:", error);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const driverService = new DriverService();
