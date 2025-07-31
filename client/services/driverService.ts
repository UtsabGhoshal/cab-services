import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/firebase/config';

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
  estimatedEarnings: number;
  distance: number;
  duration: number;
  timestamp: Date;
  rideType: "economy" | "premium" | "luxury";
  status: "pending" | "accepted" | "rejected" | "cancelled";
  driverId?: string;
}

export interface OngoingRide {
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
  earnings: number;
  status: "picking_up" | "en_route" | "arrived" | "completed";
  startTime: Date;
  estimatedArrival: Date;
  driverId: string;
}

export interface DriverStatus {
  id: string;
  isOnline: boolean;
  location?: DriverLocation;
  lastUpdate: Date;
}

export class DriverService {
  private driverId: string;
  private unsubscribeCallbacks: (() => void)[] = [];

  constructor(driverId: string) {
    this.driverId = driverId;
  }

  // Update driver online status
  async updateOnlineStatus(isOnline: boolean, location?: DriverLocation): Promise<void> {
    try {
      const driverRef = doc(db, 'drivers', this.driverId);
      await updateDoc(driverRef, {
        isOnline,
        location: location || null,
        lastUpdate: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating driver status:', error);
      throw error;
    }
  }

  // Listen to ride requests for this driver's area
  subscribeToRideRequests(
    driverLocation: DriverLocation,
    radiusKm: number,
    callback: (requests: RideRequest[]) => void
  ): () => void {
    try {
      const ridesRef = collection(db, 'rideRequests');
      // Simplified query to avoid index requirements
      const q = query(
        ridesRef,
        where('status', '==', 'pending'),
        limit(20)
      );

      const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
        const requests: RideRequest[] = [];
        
        snapshot.forEach((doc: DocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          if (data) {
            // Calculate distance to driver
            const distance = this.calculateDistance(
              driverLocation.lat,
              driverLocation.lng,
              data.pickup.lat,
              data.pickup.lng
            );

            // Only include requests within radius
            if (distance <= radiusKm) {
              requests.push({
                id: doc.id,
                passengerName: data.passengerName,
                passengerPhone: data.passengerPhone,
                pickup: data.pickup,
                destination: data.destination,
                estimatedEarnings: data.estimatedEarnings,
                distance: data.distance,
                duration: data.duration,
                timestamp: data.timestamp.toDate(),
                rideType: data.rideType,
                status: data.status,
                driverId: data.driverId,
              });
            }
          }
        });

        callback(requests);
      });

      this.unsubscribeCallbacks.push(unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to ride requests:', error);
      throw error;
    }
  }

  // Accept a ride request
  async acceptRideRequest(requestId: string): Promise<void> {
    try {
      const requestRef = doc(db, 'rideRequests', requestId);
      await updateDoc(requestRef, {
        status: 'accepted',
        driverId: this.driverId,
        acceptedAt: Timestamp.now(),
      });

      // Create ongoing ride record
      const ongoingRideRef = collection(db, 'ongoingRides');
      const requestDoc = await requestRef.get();
      const requestData = requestDoc.data();

      if (requestData) {
        await addDoc(ongoingRideRef, {
          ...requestData,
          driverId: this.driverId,
          status: 'picking_up',
          startTime: Timestamp.now(),
          estimatedArrival: Timestamp.fromDate(
            new Date(Date.now() + requestData.duration * 60 * 1000)
          ),
        });
      }
    } catch (error) {
      console.error('Error accepting ride request:', error);
      throw error;
    }
  }

  // Reject a ride request
  async rejectRideRequest(requestId: string): Promise<void> {
    try {
      const requestRef = doc(db, 'rideRequests', requestId);
      await updateDoc(requestRef, {
        status: 'rejected',
        rejectedBy: this.driverId,
        rejectedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error rejecting ride request:', error);
      throw error;
    }
  }

  // Listen to ongoing rides for this driver
  subscribeToOngoingRides(callback: (rides: OngoingRide[]) => void): () => void {
    try {
      const ridesRef = collection(db, 'ongoingRides');
      // Simplified query to avoid index requirements
      const q = query(
        ridesRef,
        where('driverId', '==', this.driverId),
        limit(10)
      );

      const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
        const rides: OngoingRide[] = [];

        snapshot.forEach((doc: DocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          if (data) {
            // Filter for active statuses in JavaScript
            const activeStatuses = ['picking_up', 'en_route', 'arrived'];
            if (activeStatuses.includes(data.status)) {
              rides.push({
                id: doc.id,
                passengerName: data.passengerName,
                passengerPhone: data.passengerPhone,
                pickup: data.pickup,
                destination: data.destination,
                earnings: data.estimatedEarnings || data.earnings,
                status: data.status,
                startTime: data.startTime?.toDate() || new Date(),
                estimatedArrival: data.estimatedArrival?.toDate() || new Date(),
                driverId: data.driverId,
              });
            }
          }
        });

        // Sort by start time in JavaScript
        rides.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
        callback(rides);
      });

      this.unsubscribeCallbacks.push(unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to ongoing rides:', error);
      throw error;
    }
  }

  // Update ride status
  async updateRideStatus(rideId: string, status: OngoingRide['status']): Promise<void> {
    try {
      const rideRef = doc(db, 'ongoingRides', rideId);
      await updateDoc(rideRef, {
        status,
        [`${status}At`]: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating ride status:', error);
      throw error;
    }
  }

  // Complete a ride
  async completeRide(rideId: string, finalEarnings: number): Promise<void> {
    try {
      const rideRef = doc(db, 'ongoingRides', rideId);
      const rideDoc = await rideRef.get();
      const rideData = rideDoc.data();

      if (rideData) {
        // Update ongoing ride to completed
        await updateDoc(rideRef, {
          status: 'completed',
          completedAt: Timestamp.now(),
          finalEarnings,
        });

        // Add to ride history
        const historyRef = collection(db, 'rideHistory');
        await addDoc(historyRef, {
          ...rideData,
          finalEarnings,
          completedAt: Timestamp.now(),
          driverId: this.driverId,
        });

        // Update driver earnings
        const driverRef = doc(db, 'drivers', this.driverId);
        const driverDoc = await driverRef.get();
        const driverData = driverDoc.data();

        if (driverData) {
          await updateDoc(driverRef, {
            totalEarnings: (driverData.totalEarnings || 0) + finalEarnings,
            totalRides: (driverData.totalRides || 0) + 1,
            lastRideCompletedAt: Timestamp.now(),
          });
        }
      }
    } catch (error) {
      console.error('Error completing ride:', error);
      throw error;
    }
  }

  // Get driver's ride history
  subscribeToRideHistory(
    limitCount: number = 50,
    callback: (history: any[]) => void
  ): () => void {
    try {
      const historyRef = collection(db, 'rideHistory');
      // Simplified query to avoid index requirements
      const q = query(
        historyRef,
        where('driverId', '==', this.driverId),
        limit(limitCount)
      );

      const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
        const history: any[] = [];

        snapshot.forEach((doc: DocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          if (data) {
            history.push({
              id: doc.id,
              ...data,
              completedAt: data.completedAt?.toDate() || new Date(),
              date: data.completedAt?.toDate() || new Date(), // Add date field for compatibility
            });
          }
        });

        // Sort by completion date in JavaScript (most recent first)
        history.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
        callback(history);
      });

      this.unsubscribeCallbacks.push(unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to ride history:', error);
      throw error;
    }
  }

  // Update driver location
  async updateLocation(location: DriverLocation): Promise<void> {
    try {
      const driverRef = doc(db, 'drivers', this.driverId);
      await updateDoc(driverRef, {
        location: {
          lat: location.lat,
          lng: location.lng,
          timestamp: Timestamp.now(),
        },
        lastUpdate: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating driver location:', error);
      throw error;
    }
  }

  // Calculate distance between two points (Haversine formula)
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in kilometers
    return d;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Clean up all subscriptions
  cleanup(): void {
    this.unsubscribeCallbacks.forEach(unsubscribe => unsubscribe());
    this.unsubscribeCallbacks = [];
  }
}

// Export singleton factory
export const createDriverService = (driverId: string) => new DriverService(driverId);
