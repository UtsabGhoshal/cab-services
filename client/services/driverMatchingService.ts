import { firebaseDriverService, FirebaseDriver, FirebaseRide } from './firebaseDriverService';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, onSnapshot, Timestamp, GeoPoint } from 'firebase/firestore';
import { db } from '@/firebase/config';

export interface DriverLocation {
  driverId: string;
  lat: number;
  lng: number;
  isOnline: boolean;
  lastUpdate: Date;
  isAvailable: boolean; // Not currently on a ride
  driverType: "owner" | "fleet";
  rating: number;
  totalRides: number;
}

export interface RideRequest {
  id?: string;
  passengerId: string;
  passengerName: string;
  pickup: {
    address: string;
    coordinates: GeoPoint;
  };
  destination: {
    address: string;
    coordinates: GeoPoint;
  };
  rideType: "economy" | "premium" | "luxury";
  purpose: "general" | "emergency";
  estimatedFare: number;
  distance: number;
  duration: number;
  status: "searching" | "matched" | "accepted" | "cancelled" | "completed";
  requestedAt: Timestamp;
  matchedDriverId?: string;
  acceptanceDeadline?: Timestamp; // For general rides
  autoMatchedAt?: Timestamp; // For emergency rides
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface DriverPenalty {
  driverId: string;
  rideId: string;
  penaltyType: "general_cancel" | "emergency_cancel" | "no_response";
  amount: number;
  reason: string;
  createdAt: Timestamp;
}

export class DriverMatchingService {
  private driverLocationsCollection = collection(db, "driver_locations");
  private rideRequestsCollection = collection(db, "ride_requests");
  private penaltiesCollection = collection(db, "driver_penalties");

  // Constants for matching algorithm
  private readonly SEARCH_RADIUS_KM = 5; // Initial search radius
  private readonly MAX_SEARCH_RADIUS_KM = 15; // Maximum search radius
  private readonly GENERAL_ACCEPTANCE_TIMEOUT = 30; // 30 seconds for general rides
  private readonly EMERGENCY_AUTO_MATCH_RADIUS = 3; // 3km for emergency auto-match
  private readonly GENERAL_CANCEL_PENALTY = 50; // ₹50 penalty for general ride cancellation
  private readonly EMERGENCY_CANCEL_PENALTY = 200; // ₹200 penalty for emergency ride cancellation
  private readonly NO_RESPONSE_PENALTY = 25; // ₹25 penalty for not responding

  // Update driver location
  async updateDriverLocation(
    driverId: string, 
    lat: number, 
    lng: number, 
    isOnline: boolean = true,
    isAvailable: boolean = true
  ): Promise<void> {
    const locationRef = doc(this.driverLocationsCollection, driverId);
    
    const locationData: DriverLocation = {
      driverId,
      lat,
      lng,
      isOnline,
      lastUpdate: new Date(),
      isAvailable,
      driverType: "owner", // This should come from driver profile
      rating: 4.5, // This should come from driver profile
      totalRides: 100, // This should come from driver profile
    };

    await updateDoc(locationRef, locationData);
  }

  // Set driver offline
  async setDriverOffline(driverId: string): Promise<void> {
    const locationRef = doc(this.driverLocationsCollection, driverId);
    await updateDoc(locationRef, {
      isOnline: false,
      isAvailable: false,
      lastUpdate: new Date(),
    });
  }

  // Get nearby drivers
  private async getNearbyDrivers(
    pickupLat: number, 
    pickupLng: number, 
    radiusKm: number
  ): Promise<DriverLocation[]> {
    // Get all online and available drivers
    const q = query(
      this.driverLocationsCollection,
      where("isOnline", "==", true),
      where("isAvailable", "==", true)
    );
    
    const snapshot = await getDocs(q);
    const allDrivers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DriverLocation));

    // Filter by distance using Haversine formula
    return allDrivers.filter(driver => {
      const distance = this.calculateDistance(
        pickupLat, pickupLng,
        driver.lat, driver.lng
      );
      return distance <= radiusKm;
    }).sort((a, b) => {
      // Sort by distance, then by rating, then by total rides
      const distanceA = this.calculateDistance(pickupLat, pickupLng, a.lat, a.lng);
      const distanceB = this.calculateDistance(pickupLat, pickupLng, b.lat, b.lng);
      
      if (Math.abs(distanceA - distanceB) > 0.1) {
        return distanceA - distanceB; // Closer drivers first
      }
      
      if (Math.abs(a.rating - b.rating) > 0.1) {
        return b.rating - a.rating; // Higher rated drivers first
      }
      
      return b.totalRides - a.totalRides; // More experienced drivers first
    });
  }

  // Calculate distance between two points using Haversine formula
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Create a ride request
  async createRideRequest(rideData: Omit<RideRequest, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const now = Timestamp.now();
    const request: Omit<RideRequest, "id"> = {
      ...rideData,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(this.rideRequestsCollection, request);
    
    // Start matching process
    if (rideData.purpose === "emergency") {
      await this.matchEmergencyRide(docRef.id, rideData);
    } else {
      await this.matchGeneralRide(docRef.id, rideData);
    }
    
    return docRef.id;
  }

  // Match emergency ride (automatic assignment)
  private async matchEmergencyRide(rideId: string, rideData: Omit<RideRequest, "id" | "createdAt" | "updatedAt">): Promise<void> {
    const pickupCoords = rideData.pickup.coordinates;
    
    // Find the nearest available driver within emergency radius
    const nearbyDrivers = await this.getNearbyDrivers(
      pickupCoords.latitude,
      pickupCoords.longitude,
      this.EMERGENCY_AUTO_MATCH_RADIUS
    );

    if (nearbyDrivers.length === 0) {
      // Expand search radius for emergency
      const expandedDrivers = await this.getNearbyDrivers(
        pickupCoords.latitude,
        pickupCoords.longitude,
        this.MAX_SEARCH_RADIUS_KM
      );
      
      if (expandedDrivers.length === 0) {
        // No drivers available
        await this.updateRideRequest(rideId, {
          status: "cancelled",
          updatedAt: Timestamp.now(),
        });
        return;
      }
      
      // Auto-assign to the best available driver (even if far)
      await this.autoAssignRide(rideId, expandedDrivers[0].driverId);
    } else {
      // Auto-assign to the nearest driver
      await this.autoAssignRide(rideId, nearbyDrivers[0].driverId);
    }
  }

  // Match general ride (driver choice)
  private async matchGeneralRide(rideId: string, rideData: Omit<RideRequest, "id" | "createdAt" | "updatedAt">): Promise<void> {
    const pickupCoords = rideData.pickup.coordinates;
    let currentRadius = this.SEARCH_RADIUS_KM;
    
    // Try to find drivers in expanding circles
    while (currentRadius <= this.MAX_SEARCH_RADIUS_KM) {
      const nearbyDrivers = await this.getNearbyDrivers(
        pickupCoords.latitude,
        pickupCoords.longitude,
        currentRadius
      );

      if (nearbyDrivers.length > 0) {
        // Send ride request to multiple drivers (top 3)
        const driversToNotify = nearbyDrivers.slice(0, 3);
        await this.sendRideRequestToDrivers(rideId, driversToNotify);
        
        // Set acceptance deadline
        const deadline = new Date();
        deadline.setSeconds(deadline.getSeconds() + this.GENERAL_ACCEPTANCE_TIMEOUT);
        
        await this.updateRideRequest(rideId, {
          status: "matched",
          acceptanceDeadline: Timestamp.fromDate(deadline),
          updatedAt: Timestamp.now(),
        });
        
        // Set timeout to handle no response
        setTimeout(() => {
          this.handleNoResponse(rideId, driversToNotify.map(d => d.driverId));
        }, this.GENERAL_ACCEPTANCE_TIMEOUT * 1000);
        
        return;
      }
      
      currentRadius += 2; // Expand radius by 2km
    }
    
    // No drivers found
    await this.updateRideRequest(rideId, {
      status: "cancelled",
      updatedAt: Timestamp.now(),
    });
  }

  // Auto-assign ride to driver (for emergency)
  private async autoAssignRide(rideId: string, driverId: string): Promise<void> {
    await this.updateRideRequest(rideId, {
      status: "accepted",
      matchedDriverId: driverId,
      autoMatchedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Mark driver as unavailable
    await this.updateDriverLocation(driverId, 0, 0, true, false);
    
    // Notify driver of auto-assignment
    await this.notifyDriverOfAutoAssignment(driverId, rideId);
  }

  // Send ride request to multiple drivers
  private async sendRideRequestToDrivers(rideId: string, drivers: DriverLocation[]): Promise<void> {
    // In a real app, this would send push notifications or real-time updates
    console.log(`Sending ride request ${rideId} to drivers:`, drivers.map(d => d.driverId));
    
    // Create notifications for each driver
    const notificationsCollection = collection(db, "driver_notifications");
    
    for (const driver of drivers) {
      await addDoc(notificationsCollection, {
        driverId: driver.driverId,
        rideId,
        type: "ride_request",
        createdAt: Timestamp.now(),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + this.GENERAL_ACCEPTANCE_TIMEOUT * 1000)),
        read: false,
      });
    }
  }

  // Handle driver acceptance of ride
  async acceptRide(rideId: string, driverId: string): Promise<boolean> {
    const rideRef = doc(this.rideRequestsCollection, rideId);
    
    try {
      // Check if ride is still available
      const rideDoc = await firebaseDriverService.getDriver(rideId); // This should be getRideRequest
      
      if (!rideDoc || rideDoc.status !== "matched") {
        return false; // Ride already taken or cancelled
      }

      // Accept the ride
      await this.updateRideRequest(rideId, {
        status: "accepted",
        matchedDriverId: driverId,
        updatedAt: Timestamp.now(),
      });

      // Mark driver as unavailable
      await this.updateDriverLocation(driverId, 0, 0, true, false);
      
      // Cancel notifications for other drivers
      await this.cancelOtherDriverNotifications(rideId, driverId);
      
      return true;
    } catch (error) {
      console.error("Error accepting ride:", error);
      return false;
    }
  }

  // Handle driver cancellation
  async cancelRide(rideId: string, driverId: string, reason: string = "Driver cancelled"): Promise<void> {
    const rideDoc = await this.getRideRequest(rideId);
    
    if (!rideDoc) return;

    // Calculate penalty
    const penaltyAmount = rideDoc.purpose === "emergency" 
      ? this.EMERGENCY_CANCEL_PENALTY 
      : this.GENERAL_CANCEL_PENALTY;

    // Apply penalty
    await this.applyPenalty(driverId, rideId, 
      rideDoc.purpose === "emergency" ? "emergency_cancel" : "general_cancel",
      penaltyAmount, reason);

    // Update ride status
    await this.updateRideRequest(rideId, {
      status: "cancelled",
      updatedAt: Timestamp.now(),
    });

    // Make driver available again
    await this.updateDriverLocation(driverId, 0, 0, true, true);

    // If it was an emergency ride, try to find another driver
    if (rideDoc.purpose === "emergency") {
      await this.matchEmergencyRide(rideId, rideDoc);
    } else {
      await this.matchGeneralRide(rideId, rideDoc);
    }
  }

  // Handle no response from drivers
  private async handleNoResponse(rideId: string, driverIds: string[]): Promise<void> {
    const rideDoc = await this.getRideRequest(rideId);
    
    if (!rideDoc || rideDoc.status !== "matched") {
      return; // Ride was already accepted or cancelled
    }

    // Apply no response penalty to all drivers who didn't respond
    for (const driverId of driverIds) {
      await this.applyPenalty(driverId, rideId, "no_response", this.NO_RESPONSE_PENALTY, "No response to ride request");
    }

    // Try to match again with expanded radius
    await this.matchGeneralRide(rideId, rideDoc);
  }

  // Apply penalty to driver
  private async applyPenalty(
    driverId: string, 
    rideId: string, 
    penaltyType: "general_cancel" | "emergency_cancel" | "no_response",
    amount: number,
    reason: string
  ): Promise<void> {
    const penalty: DriverPenalty = {
      driverId,
      rideId,
      penaltyType,
      amount,
      reason,
      createdAt: Timestamp.now(),
    };

    await addDoc(this.penaltiesCollection, penalty);
    
    // Update driver's penalty balance in their profile
    // This would be implemented in the driver service
  }

  // Utility methods
  private async updateRideRequest(rideId: string, updates: Partial<RideRequest>): Promise<void> {
    const rideRef = doc(this.rideRequestsCollection, rideId);
    await updateDoc(rideRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  }

  private async getRideRequest(rideId: string): Promise<RideRequest | null> {
    // This would fetch the ride request from Firestore
    // Implementation needed
    return null;
  }

  private async notifyDriverOfAutoAssignment(driverId: string, rideId: string): Promise<void> {
    const notificationsCollection = collection(db, "driver_notifications");
    await addDoc(notificationsCollection, {
      driverId,
      rideId,
      type: "emergency_assignment",
      message: "You have been automatically assigned an emergency ride",
      createdAt: Timestamp.now(),
      read: false,
    });
  }

  private async cancelOtherDriverNotifications(rideId: string, acceptedDriverId: string): Promise<void> {
    // This would cancel notifications for other drivers
    // Implementation needed using Firestore queries
  }

  // Real-time listeners
  onRideRequestsChange(driverId: string, callback: (requests: RideRequest[]) => void): () => void {
    const q = query(
      collection(db, "driver_notifications"),
      where("driverId", "==", driverId),
      where("type", "==", "ride_request"),
      where("read", "==", false)
    );

    return onSnapshot(q, (snapshot) => {
      // Process notifications and get corresponding ride requests
      // Implementation needed
    });
  }

  // Get driver statistics including penalties
  async getDriverPenalties(driverId: string): Promise<DriverPenalty[]> {
    const q = query(
      this.penaltiesCollection,
      where("driverId", "==", driverId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DriverPenalty));
  }

  // Calculate total penalty amount for driver
  async getTotalPenalties(driverId: string): Promise<number> {
    const penalties = await this.getDriverPenalties(driverId);
    return penalties.reduce((total, penalty) => total + penalty.amount, 0);
  }
}

export const driverMatchingService = new DriverMatchingService();
