import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  Timestamp,
  onSnapshot,
  writeBatch,
  increment,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "./config";
import bcrypt from "bcryptjs";

// Collections
const DRIVERS_COLLECTION = "drivers";
const VEHICLES_COLLECTION = "vehicles";
const RIDES_COLLECTION = "rides";
const ADMIN_LOGS_COLLECTION = "admin_logs";
const DRIVER_APPLICATIONS_COLLECTION = "driver_applications";
const EARNINGS_COLLECTION = "earnings";
const NOTIFICATIONS_COLLECTION = "notifications";

// Types
export interface FirebaseDriver {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  driverType: {
    type: "owner" | "fleet";
    vehicleId?: string;
    commissionRate?: number;
    salaryPerKm?: number;
  };
  status: "active" | "inactive" | "pending" | "suspended";
  documentsVerified: boolean;
  licenseNumber: string;
  vehicleNumber?: string;
  vehicleModel?: string;
  assignedVehicle?: string;
  
  // Performance metrics
  averageRating: number;
  totalRides: number;
  totalEarnings: number;
  totalKmDriven: number;
  acceptanceRate: number;
  completionRate: number;
  onlineHours: number;
  
  // Timestamps
  joinDate: Date;
  lastActive?: Date;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Current status
  isOnline: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
    lastUpdated: Date;
  };
  
  // Shift data for fleet drivers
  currentShift?: {
    startTime: Date;
    targetKm?: number;
    completedKm?: number;
    earnings: number;
  };
}

export interface FirebaseVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  registrationNumber: string;
  type: "company" | "driver_owned";
  status: "available" | "assigned" | "maintenance" | "out_of_service";
  
  // Assignment
  assignedDriverId?: string;
  assignedDriverName?: string;
  
  // Vehicle details
  mileage: number;
  fuelType: "petrol" | "diesel" | "cng" | "electric";
  
  // Maintenance and documents
  lastService: Date;
  nextService: Date;
  insuranceExpiry: Date;
  registrationExpiry: Date;
  pollutionExpiry: Date;
  
  // Performance
  totalKmDriven: number;
  totalRides: number;
  averageRating: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface DriverApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  driverType: "owner" | "fleet";
  vehicleDetails?: {
    make: string;
    model: string;
    year: number;
    registrationNumber: string;
  };
  
  // Documents
  documents: {
    license: string;
    aadhar: string;
    vehicleRC?: string;
    insurance?: string;
    pollution?: string;
  };
  
  status: "pending" | "approved" | "rejected";
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface AdminActivity {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: "driver" | "vehicle" | "ride" | "application";
  targetId: string;
  details: Record<string, any>;
  timestamp: Date;
}

export interface DriverEarnings {
  id: string;
  driverId: string;
  date: Date;
  totalEarnings: number;
  commission?: number;
  salaryPerKm?: number;
  totalKmDriven: number;
  totalRides: number;
  breakdown: {
    baseFare: number;
    distanceFare: number;
    timeFare: number;
    bonus: number;
    deductions: number;
  };
}

class AdminFirebaseService {
  // Driver Management
  async getAllDrivers(): Promise<FirebaseDriver[]> {
    try {
      const driversRef = collection(db, DRIVERS_COLLECTION);
      const q = query(driversRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      const drivers: FirebaseDriver[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        drivers.push({
          id: doc.id,
          ...data,
          joinDate: data.joinDate?.toDate() || new Date(),
          lastActive: data.lastActive?.toDate(),
          approvedAt: data.approvedAt?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          currentLocation: data.currentLocation ? {
            ...data.currentLocation,
            lastUpdated: data.currentLocation.lastUpdated?.toDate() || new Date(),
          } : undefined,
          currentShift: data.currentShift ? {
            ...data.currentShift,
            startTime: data.currentShift.startTime?.toDate() || new Date(),
          } : undefined,
        } as FirebaseDriver);
      });
      
      return drivers;
    } catch (error) {
      console.error("Error getting all drivers:", error);
      throw error;
    }
  }

  async getDriverById(id: string): Promise<FirebaseDriver | null> {
    try {
      const driverRef = doc(db, DRIVERS_COLLECTION, id);
      const driverSnap = await getDoc(driverRef);
      
      if (!driverSnap.exists()) {
        return null;
      }
      
      const data = driverSnap.data();
      return {
        id: driverSnap.id,
        ...data,
        joinDate: data.joinDate?.toDate() || new Date(),
        lastActive: data.lastActive?.toDate(),
        approvedAt: data.approvedAt?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        currentLocation: data.currentLocation ? {
          ...data.currentLocation,
          lastUpdated: data.currentLocation.lastUpdated?.toDate() || new Date(),
        } : undefined,
        currentShift: data.currentShift ? {
          ...data.currentShift,
          startTime: data.currentShift.startTime?.toDate() || new Date(),
        } : undefined,
      } as FirebaseDriver;
    } catch (error) {
      console.error("Error getting driver by ID:", error);
      return null;
    }
  }

  async createDriver(driverData: Omit<FirebaseDriver, "id" | "createdAt" | "updatedAt">): Promise<FirebaseDriver> {
    try {
      const hashedPassword = await bcrypt.hash(driverData.password, 12);
      
      const newDriver = {
        ...driverData,
        password: hashedPassword,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        joinDate: Timestamp.fromDate(driverData.joinDate),
        lastActive: driverData.lastActive ? Timestamp.fromDate(driverData.lastActive) : null,
        approvedAt: driverData.approvedAt ? Timestamp.fromDate(driverData.approvedAt) : null,
        currentLocation: driverData.currentLocation ? {
          ...driverData.currentLocation,
          lastUpdated: Timestamp.fromDate(driverData.currentLocation.lastUpdated),
        } : null,
        currentShift: driverData.currentShift ? {
          ...driverData.currentShift,
          startTime: Timestamp.fromDate(driverData.currentShift.startTime),
        } : null,
      };
      
      const docRef = await addDoc(collection(db, DRIVERS_COLLECTION), newDriver);
      
      // Log admin activity
      await this.logAdminActivity("system", "System", "create_driver", "driver", docRef.id, {
        driverName: driverData.name,
        driverEmail: driverData.email,
      });
      
      return {
        id: docRef.id,
        ...driverData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error("Error creating driver:", error);
      throw error;
    }
  }

  async updateDriver(id: string, updates: Partial<FirebaseDriver>, adminId: string = "system"): Promise<void> {
    try {
      const driverRef = doc(db, DRIVERS_COLLECTION, id);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };
      
      // Convert Date objects to Timestamps
      if (updates.joinDate) updateData.joinDate = Timestamp.fromDate(updates.joinDate);
      if (updates.lastActive) updateData.lastActive = Timestamp.fromDate(updates.lastActive);
      if (updates.approvedAt) updateData.approvedAt = Timestamp.fromDate(updates.approvedAt);
      
      await updateDoc(driverRef, updateData);
      
      // Log admin activity
      await this.logAdminActivity(adminId, "Admin", "update_driver", "driver", id, updates);
    } catch (error) {
      console.error("Error updating driver:", error);
      throw error;
    }
  }

  async approveDriver(id: string, adminId: string, adminName: string): Promise<void> {
    try {
      await this.updateDriver(id, {
        status: "active",
        documentsVerified: true,
        approvedAt: new Date(),
      }, adminId);
      
      // Send notification to driver
      await this.createNotification(id, "driver_approved", "Your driver application has been approved! You can now start accepting rides.", {
        approvedBy: adminName,
        approvedAt: new Date().toISOString(),
      });
      
      // Log admin activity
      await this.logAdminActivity(adminId, adminName, "approve_driver", "driver", id, {
        approvedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error approving driver:", error);
      throw error;
    }
  }

  async rejectDriver(id: string, reason: string, adminId: string, adminName: string): Promise<void> {
    try {
      await this.updateDriver(id, {
        status: "inactive",
        documentsVerified: false,
      }, adminId);
      
      // Send notification to driver
      await this.createNotification(id, "driver_rejected", `Your driver application has been rejected. Reason: ${reason}`, {
        rejectedBy: adminName,
        rejectionReason: reason,
        rejectedAt: new Date().toISOString(),
      });
      
      // Log admin activity
      await this.logAdminActivity(adminId, adminName, "reject_driver", "driver", id, {
        rejectionReason: reason,
        rejectedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error rejecting driver:", error);
      throw error;
    }
  }

  async suspendDriver(id: string, reason: string, adminId: string, adminName: string): Promise<void> {
    try {
      await this.updateDriver(id, {
        status: "suspended",
        isOnline: false,
      }, adminId);
      
      // Send notification to driver
      await this.createNotification(id, "driver_suspended", `Your account has been suspended. Reason: ${reason}`, {
        suspendedBy: adminName,
        suspensionReason: reason,
        suspendedAt: new Date().toISOString(),
      });
      
      // Log admin activity
      await this.logAdminActivity(adminId, adminName, "suspend_driver", "driver", id, {
        suspensionReason: reason,
        suspendedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error suspending driver:", error);
      throw error;
    }
  }

  // Vehicle Management
  async getAllVehicles(): Promise<FirebaseVehicle[]> {
    try {
      const vehiclesRef = collection(db, VEHICLES_COLLECTION);
      const q = query(vehiclesRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      const vehicles: FirebaseVehicle[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        vehicles.push({
          id: doc.id,
          ...data,
          lastService: data.lastService?.toDate() || new Date(),
          nextService: data.nextService?.toDate() || new Date(),
          insuranceExpiry: data.insuranceExpiry?.toDate() || new Date(),
          registrationExpiry: data.registrationExpiry?.toDate() || new Date(),
          pollutionExpiry: data.pollutionExpiry?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as FirebaseVehicle);
      });
      
      return vehicles;
    } catch (error) {
      console.error("Error getting all vehicles:", error);
      throw error;
    }
  }

  async createVehicle(vehicleData: Omit<FirebaseVehicle, "id" | "createdAt" | "updatedAt">): Promise<FirebaseVehicle> {
    try {
      const newVehicle = {
        ...vehicleData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastService: Timestamp.fromDate(vehicleData.lastService),
        nextService: Timestamp.fromDate(vehicleData.nextService),
        insuranceExpiry: Timestamp.fromDate(vehicleData.insuranceExpiry),
        registrationExpiry: Timestamp.fromDate(vehicleData.registrationExpiry),
        pollutionExpiry: Timestamp.fromDate(vehicleData.pollutionExpiry),
      };
      
      const docRef = await addDoc(collection(db, VEHICLES_COLLECTION), newVehicle);
      
      return {
        id: docRef.id,
        ...vehicleData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error("Error creating vehicle:", error);
      throw error;
    }
  }

  async assignVehicleToDriver(vehicleId: string, driverId: string, adminId: string, adminName: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Get driver details
      const driver = await this.getDriverById(driverId);
      if (!driver) throw new Error("Driver not found");
      
      // Update vehicle
      const vehicleRef = doc(db, VEHICLES_COLLECTION, vehicleId);
      batch.update(vehicleRef, {
        status: "assigned",
        assignedDriverId: driverId,
        assignedDriverName: driver.name,
        updatedAt: Timestamp.now(),
      });
      
      // Update driver
      const driverRef = doc(db, DRIVERS_COLLECTION, driverId);
      batch.update(driverRef, {
        assignedVehicle: vehicleId,
        updatedAt: Timestamp.now(),
      });
      
      await batch.commit();
      
      // Send notification to driver
      await this.createNotification(driverId, "vehicle_assigned", `A vehicle has been assigned to you.`, {
        vehicleId,
        assignedBy: adminName,
        assignedAt: new Date().toISOString(),
      });
      
      // Log admin activity
      await this.logAdminActivity(adminId, adminName, "assign_vehicle", "vehicle", vehicleId, {
        driverId,
        driverName: driver.name,
        assignedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error assigning vehicle to driver:", error);
      throw error;
    }
  }

  // Analytics and Statistics
  async getAdminDashboardStats(): Promise<any> {
    try {
      const [drivers, vehicles] = await Promise.all([
        this.getAllDrivers(),
        this.getAllVehicles(),
      ]);
      
      const stats = {
        drivers: {
          total: drivers.length,
          active: drivers.filter(d => d.status === "active").length,
          pending: drivers.filter(d => d.status === "pending").length,
          suspended: drivers.filter(d => d.status === "suspended").length,
          online: drivers.filter(d => d.isOnline).length,
          vehicleOwners: drivers.filter(d => d.driverType.type === "owner").length,
          fleetDrivers: drivers.filter(d => d.driverType.type === "fleet").length,
        },
        vehicles: {
          total: vehicles.length,
          available: vehicles.filter(v => v.status === "available").length,
          assigned: vehicles.filter(v => v.status === "assigned").length,
          maintenance: vehicles.filter(v => v.status === "maintenance").length,
          company: vehicles.filter(v => v.type === "company").length,
          driverOwned: vehicles.filter(v => v.type === "driver_owned").length,
        },
        earnings: {
          totalRevenue: drivers.reduce((sum, d) => sum + d.totalEarnings, 0),
          totalRides: drivers.reduce((sum, d) => sum + d.totalRides, 0),
          totalKmDriven: drivers.reduce((sum, d) => sum + d.totalKmDriven, 0),
          averageRating: drivers.length > 0 
            ? drivers.reduce((sum, d) => sum + d.averageRating, 0) / drivers.length 
            : 0,
        },
        performance: {
          averageAcceptanceRate: drivers.length > 0 
            ? drivers.reduce((sum, d) => sum + d.acceptanceRate, 0) / drivers.length 
            : 0,
          averageCompletionRate: drivers.length > 0 
            ? drivers.reduce((sum, d) => sum + d.completionRate, 0) / drivers.length 
            : 0,
          totalOnlineHours: drivers.reduce((sum, d) => sum + d.onlineHours, 0),
        },
      };
      
      return stats;
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      throw error;
    }
  }

  // Notifications
  async createNotification(recipientId: string, type: string, message: string, data: any = {}): Promise<void> {
    try {
      const notification = {
        recipientId,
        recipientType: "driver",
        type,
        message,
        data,
        read: false,
        createdAt: Timestamp.now(),
      };
      
      await addDoc(collection(db, NOTIFICATIONS_COLLECTION), notification);
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  }

  // Admin Activity Logging
  async logAdminActivity(
    adminId: string,
    adminName: string,
    action: string,
    targetType: "driver" | "vehicle" | "ride" | "application",
    targetId: string,
    details: Record<string, any>
  ): Promise<void> {
    try {
      const activity: Omit<AdminActivity, "id"> = {
        adminId,
        adminName,
        action,
        targetType,
        targetId,
        details,
        timestamp: new Date(),
      };
      
      await addDoc(collection(db, ADMIN_LOGS_COLLECTION), {
        ...activity,
        timestamp: Timestamp.fromDate(activity.timestamp),
      });
    } catch (error) {
      console.error("Error logging admin activity:", error);
    }
  }

  async getAdminActivityLogs(limit: number = 50): Promise<AdminActivity[]> {
    try {
      const logsRef = collection(db, ADMIN_LOGS_COLLECTION);
      const q = query(logsRef, orderBy("timestamp", "desc"), limit(limit));
      const querySnapshot = await getDocs(q);
      
      const logs: AdminActivity[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        logs.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
        } as AdminActivity);
      });
      
      return logs;
    } catch (error) {
      console.error("Error getting admin activity logs:", error);
      return [];
    }
  }

  // Real-time subscriptions
  subscribeToDrivers(callback: (drivers: FirebaseDriver[]) => void): () => void {
    const driversRef = collection(db, DRIVERS_COLLECTION);
    const q = query(driversRef, orderBy("createdAt", "desc"));
    
    return onSnapshot(q, (querySnapshot) => {
      const drivers: FirebaseDriver[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        drivers.push({
          id: doc.id,
          ...data,
          joinDate: data.joinDate?.toDate() || new Date(),
          lastActive: data.lastActive?.toDate(),
          approvedAt: data.approvedAt?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          currentLocation: data.currentLocation ? {
            ...data.currentLocation,
            lastUpdated: data.currentLocation.lastUpdated?.toDate() || new Date(),
          } : undefined,
          currentShift: data.currentShift ? {
            ...data.currentShift,
            startTime: data.currentShift.startTime?.toDate() || new Date(),
          } : undefined,
        } as FirebaseDriver);
      });
      callback(drivers);
    });
  }

  subscribeToVehicles(callback: (vehicles: FirebaseVehicle[]) => void): () => void {
    const vehiclesRef = collection(db, VEHICLES_COLLECTION);
    const q = query(vehiclesRef, orderBy("createdAt", "desc"));
    
    return onSnapshot(q, (querySnapshot) => {
      const vehicles: FirebaseVehicle[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        vehicles.push({
          id: doc.id,
          ...data,
          lastService: data.lastService?.toDate() || new Date(),
          nextService: data.nextService?.toDate() || new Date(),
          insuranceExpiry: data.insuranceExpiry?.toDate() || new Date(),
          registrationExpiry: data.registrationExpiry?.toDate() || new Date(),
          pollutionExpiry: data.pollutionExpiry?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as FirebaseVehicle);
      });
      callback(vehicles);
    });
  }
}

export const adminFirebaseService = new AdminFirebaseService();
