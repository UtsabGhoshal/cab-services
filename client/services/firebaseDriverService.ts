import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  DocumentData
} from "firebase/firestore";
import { db } from "@/firebase/config";

// Types for the new driver system
export interface DriverType {
  type: "owner" | "fleet";
  vehicleId?: string;
  commissionRate?: number; // For vehicle owners (e.g., 0.05 for 5%)
  salaryPerKm?: number; // For fleet drivers (e.g., 12 for ₹12/km)
}

export interface FirebaseDriver {
  id?: string;
  name: string;
  email: string;
  phone: string;
  driverType: DriverType;
  status: "active" | "inactive" | "pending";
  rating: number;
  totalRides: number;
  totalEarnings: number;
  totalKmDriven: number;
  joinDate: Timestamp;
  
  // Vehicle Information
  vehicleNumber?: string; // For vehicle owners
  vehicleModel?: string; // For vehicle owners
  assignedVehicleId?: string; // For fleet drivers
  
  // License and Documents
  licenseNumber: string;
  licenseExpiry: Timestamp;
  documentsVerified: boolean;
  
  // ID Verification
  idProofType?: "aadhar" | "passport" | "voter";
  idProofNumber?: string;
  
  // Background Check
  hasCleanRecord: boolean;
  backgroundCheckCompleted: boolean;
  
  // Performance Metrics
  acceptanceRate: number;
  completionRate: number;
  averageRating: number;
  onlineHours: number;
  
  // Shift Information (for fleet drivers)
  currentShift?: {
    startTime: Timestamp;
    targetKm?: number;
    completedKm?: number;
    isActive: boolean;
  };
  
  // Created/Updated timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirebaseVehicle {
  id?: string;
  make: string;
  model: string;
  year: number;
  color: string;
  registrationNumber: string;
  type: "company" | "driver_owned";
  status: "available" | "assigned" | "maintenance";
  
  // Assignment
  assignedDriverId?: string;
  assignedDriverName?: string;
  
  // Maintenance
  mileage: number;
  lastService: Timestamp;
  nextServiceDue: Timestamp;
  
  // Documents
  insuranceExpiry: Timestamp;
  registrationExpiry: Timestamp;
  pollutionCertExpiry: Timestamp;
  
  // Created/Updated timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirebaseRide {
  id?: string;
  driverId: string;
  driverName: string;
  passengerId: string;
  passengerName: string;
  
  // Location data
  pickup: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  destination: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  
  // Ride details
  distance: number; // in km
  duration: number; // in minutes
  rideType: "economy" | "premium" | "luxury";
  status: "requested" | "accepted" | "picking_up" | "en_route" | "completed" | "cancelled";
  
  // Financial details
  totalFare: number;
  driverEarnings: number;
  commission?: number; // For vehicle owners
  kmSalary?: number; // For fleet drivers
  
  // Timestamps
  requestedAt: Timestamp;
  acceptedAt?: Timestamp;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  
  // Ratings
  passengerRating?: number;
  driverRating?: number;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CommissionSettings {
  id?: string;
  vehicleOwnerRate: number; // Percentage
  fleetDriverSalaryRate: number; // Per km
  platformFee: number; // Percentage
  bonusThresholds: {
    rides: number;
    bonus: number;
  }[];
  updatedAt: Timestamp;
  updatedBy: string;
}

export class FirebaseDriverService {
  // Collections
  private driversCollection = collection(db, "drivers");
  private vehiclesCollection = collection(db, "vehicles");
  private ridesCollection = collection(db, "rides");
  private settingsCollection = collection(db, "settings");

  // Driver operations
  async createDriver(driverData: Omit<FirebaseDriver, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const now = Timestamp.now();
    const driver: Omit<FirebaseDriver, "id"> = {
      ...driverData,
      createdAt: now,
      updatedAt: now,
    };
    
    const docRef = await addDoc(this.driversCollection, driver);
    return docRef.id;
  }

  async updateDriver(driverId: string, updates: Partial<FirebaseDriver>): Promise<void> {
    const driverRef = doc(this.driversCollection, driverId);
    await updateDoc(driverRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  }

  async getDriver(driverId: string): Promise<FirebaseDriver | null> {
    const driverRef = doc(this.driversCollection, driverId);
    const driverSnap = await getDoc(driverRef);
    
    if (driverSnap.exists()) {
      return { id: driverSnap.id, ...driverSnap.data() } as FirebaseDriver;
    }
    return null;
  }

  async getAllDrivers(): Promise<FirebaseDriver[]> {
    const q = query(this.driversCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as FirebaseDriver[];
  }

  async getDriversByType(type: "owner" | "fleet"): Promise<FirebaseDriver[]> {
    const q = query(
      this.driversCollection, 
      where("driverType.type", "==", type),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as FirebaseDriver[];
  }

  async getDriversByStatus(status: "active" | "inactive" | "pending"): Promise<FirebaseDriver[]> {
    const q = query(
      this.driversCollection, 
      where("status", "==", status),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as FirebaseDriver[];
  }

  // Vehicle operations
  async createVehicle(vehicleData: Omit<FirebaseVehicle, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const now = Timestamp.now();
    const vehicle: Omit<FirebaseVehicle, "id"> = {
      ...vehicleData,
      createdAt: now,
      updatedAt: now,
    };
    
    const docRef = await addDoc(this.vehiclesCollection, vehicle);
    return docRef.id;
  }

  async updateVehicle(vehicleId: string, updates: Partial<FirebaseVehicle>): Promise<void> {
    const vehicleRef = doc(this.vehiclesCollection, vehicleId);
    await updateDoc(vehicleRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  }

  async getVehicle(vehicleId: string): Promise<FirebaseVehicle | null> {
    const vehicleRef = doc(this.vehiclesCollection, vehicleId);
    const vehicleSnap = await getDoc(vehicleRef);
    
    if (vehicleSnap.exists()) {
      return { id: vehicleSnap.id, ...vehicleSnap.data() } as FirebaseVehicle;
    }
    return null;
  }

  async getAllVehicles(): Promise<FirebaseVehicle[]> {
    const q = query(this.vehiclesCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as FirebaseVehicle[];
  }

  async getAvailableCompanyVehicles(): Promise<FirebaseVehicle[]> {
    const q = query(
      this.vehiclesCollection,
      where("type", "==", "company"),
      where("status", "==", "available"),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as FirebaseVehicle[];
  }

  async assignVehicleToDriver(vehicleId: string, driverId: string, driverName: string): Promise<void> {
    // Update vehicle
    await this.updateVehicle(vehicleId, {
      status: "assigned",
      assignedDriverId: driverId,
      assignedDriverName: driverName,
    });

    // Update driver
    await this.updateDriver(driverId, {
      assignedVehicleId: vehicleId,
    });
  }

  async unassignVehicle(vehicleId: string): Promise<void> {
    const vehicle = await this.getVehicle(vehicleId);
    if (vehicle && vehicle.assignedDriverId) {
      // Update driver
      await this.updateDriver(vehicle.assignedDriverId, {
        assignedVehicleId: undefined,
      });
    }

    // Update vehicle
    await this.updateVehicle(vehicleId, {
      status: "available",
      assignedDriverId: undefined,
      assignedDriverName: undefined,
    });
  }

  // Ride operations
  async createRide(rideData: Omit<FirebaseRide, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const now = Timestamp.now();
    const ride: Omit<FirebaseRide, "id"> = {
      ...rideData,
      createdAt: now,
      updatedAt: now,
    };
    
    const docRef = await addDoc(this.ridesCollection, ride);
    return docRef.id;
  }

  async updateRide(rideId: string, updates: Partial<FirebaseRide>): Promise<void> {
    const rideRef = doc(this.ridesCollection, rideId);
    await updateDoc(rideRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  }

  async getRidesByDriver(driverId: string): Promise<FirebaseRide[]> {
    const q = query(
      this.ridesCollection,
      where("driverId", "==", driverId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as FirebaseRide[];
  }

  async getActiveRidesByDriver(driverId: string): Promise<FirebaseRide[]> {
    const q = query(
      this.ridesCollection,
      where("driverId", "==", driverId),
      where("status", "in", ["accepted", "picking_up", "en_route"]),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as FirebaseRide[];
  }

  // Commission and settings operations
  async getCommissionSettings(): Promise<CommissionSettings | null> {
    const q = query(this.settingsCollection, where("type", "==", "commission"));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as CommissionSettings;
    }
    return null;
  }

  async updateCommissionSettings(settings: Omit<CommissionSettings, "id" | "updatedAt">, updatedBy: string): Promise<void> {
    const existingSettings = await this.getCommissionSettings();
    
    const settingsData = {
      ...settings,
      type: "commission",
      updatedAt: Timestamp.now(),
      updatedBy,
    };

    if (existingSettings?.id) {
      const settingsRef = doc(this.settingsCollection, existingSettings.id);
      await updateDoc(settingsRef, settingsData);
    } else {
      await addDoc(this.settingsCollection, settingsData);
    }
  }

  // Real-time listeners
  onDriversChange(callback: (drivers: FirebaseDriver[]) => void): () => void {
    const q = query(this.driversCollection, orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const drivers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as FirebaseDriver[];
      callback(drivers);
    });
  }

  onVehiclesChange(callback: (vehicles: FirebaseVehicle[]) => void): () => void {
    const q = query(this.vehiclesCollection, orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const vehicles = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as FirebaseVehicle[];
      callback(vehicles);
    });
  }

  onDriverRidesChange(driverId: string, callback: (rides: FirebaseRide[]) => void): () => void {
    const q = query(
      this.ridesCollection,
      where("driverId", "==", driverId),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snapshot) => {
      const rides = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as FirebaseRide[];
      callback(rides);
    });
  }

  // Utility functions
  calculateDriverEarnings(
    totalFare: number, 
    distance: number, 
    driverType: DriverType
  ): { driverEarnings: number; commission?: number; kmSalary?: number } {
    if (driverType.type === "owner") {
      const commission = totalFare * (driverType.commissionRate || 0.05);
      return {
        driverEarnings: totalFare - commission,
        commission,
      };
    } else {
      const kmSalary = distance * (driverType.salaryPerKm || 12);
      return {
        driverEarnings: kmSalary,
        kmSalary,
      };
    }
  }

  async updateDriverStats(driverId: string, rideData: { 
    earnings: number; 
    distance: number; 
    rating: number;
  }): Promise<void> {
    const driver = await this.getDriver(driverId);
    if (!driver) return;

    const newTotalRides = driver.totalRides + 1;
    const newTotalEarnings = driver.totalEarnings + rideData.earnings;
    const newTotalKmDriven = driver.totalKmDriven + rideData.distance;
    
    // Calculate new average rating
    const newAverageRating = ((driver.averageRating * driver.totalRides) + rideData.rating) / newTotalRides;

    await this.updateDriver(driverId, {
      totalRides: newTotalRides,
      totalEarnings: newTotalEarnings,
      totalKmDriven: newTotalKmDriven,
      averageRating: Number(newAverageRating.toFixed(1)),
    });
  }

  // Batch operations for admin
  async approveDriver(driverId: string): Promise<void> {
    await this.updateDriver(driverId, {
      status: "active",
      documentsVerified: true,
    });
  }

  async rejectDriver(driverId: string): Promise<void> {
    await this.updateDriver(driverId, {
      status: "inactive",
    });
  }

  async suspendDriver(driverId: string): Promise<void> {
    await this.updateDriver(driverId, {
      status: "inactive",
    });
  }
}

// Export singleton instance
export const firebaseDriverService = new FirebaseDriverService();
