// Local database service for storing driver information when Firebase is unavailable
import { FirebaseDriver } from "./firebaseDriverService";

interface LocalStorageDriver extends Omit<FirebaseDriver, 'joinDate' | 'licenseExpiry' | 'createdAt' | 'updatedAt' | 'currentShift'> {
  joinDate: string;
  licenseExpiry: string;
  createdAt: string;
  updatedAt: string;
  currentShift?: {
    startTime: string;
    targetKm?: number;
    completedKm?: number;
    isActive: boolean;
  };
}

class LocalDatabaseService {
  private readonly DRIVERS_KEY = 'uride_drivers_db';
  private readonly RIDES_KEY = 'uride_rides_db';
  private readonly VEHICLES_KEY = 'uride_vehicles_db';

  // Driver operations
  async createDriver(driverData: Omit<FirebaseDriver, "id" | "createdAt" | "updatedAt">): Promise<string> {
    try {
      const drivers = this.getStoredDrivers();
      const driverId = `local_driver_${Date.now()}`;
      
      const newDriver: LocalStorageDriver = {
        ...driverData,
        id: driverId,
        joinDate: driverData.joinDate.toDate().toISOString(),
        licenseExpiry: driverData.licenseExpiry.toDate().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        currentShift: driverData.currentShift ? {
          ...driverData.currentShift,
          startTime: driverData.currentShift.startTime.toDate().toISOString(),
        } : undefined,
      };

      drivers[driverId] = newDriver;
      this.saveDrivers(drivers);
      
      console.log(`✅ Driver stored locally: ${driverData.email}`);
      return driverId;
    } catch (error) {
      console.error("Error creating driver in local storage:", error);
      throw error;
    }
  }

  async getDriverByEmail(email: string): Promise<FirebaseDriver | null> {
    try {
      const drivers = this.getStoredDrivers();
      const driver = Object.values(drivers).find(d => d.email.toLowerCase() === email.toLowerCase());
      
      if (!driver) return null;

      // Convert back to FirebaseDriver format
      return this.convertToFirebaseDriver(driver);
    } catch (error) {
      console.error("Error getting driver by email from local storage:", error);
      return null;
    }
  }

  async updateDriver(driverId: string, updates: Partial<FirebaseDriver>): Promise<void> {
    try {
      const drivers = this.getStoredDrivers();
      const existingDriver = drivers[driverId];
      
      if (!existingDriver) {
        throw new Error(`Driver ${driverId} not found`);
      }

      // Convert updates to local storage format
      const localUpdates: Partial<LocalStorageDriver> = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      if (updates.joinDate) {
        localUpdates.joinDate = updates.joinDate.toDate().toISOString();
      }
      if (updates.licenseExpiry) {
        localUpdates.licenseExpiry = updates.licenseExpiry.toDate().toISOString();
      }
      if (updates.currentShift) {
        localUpdates.currentShift = {
          ...updates.currentShift,
          startTime: updates.currentShift.startTime.toDate().toISOString(),
        };
      }

      drivers[driverId] = { ...existingDriver, ...localUpdates };
      this.saveDrivers(drivers);
      
      console.log(`✅ Driver updated locally: ${driverId}`);
    } catch (error) {
      console.error("Error updating driver in local storage:", error);
      throw error;
    }
  }

  async getAllDrivers(): Promise<FirebaseDriver[]> {
    try {
      const drivers = this.getStoredDrivers();
      return Object.values(drivers).map(driver => this.convertToFirebaseDriver(driver));
    } catch (error) {
      console.error("Error getting all drivers from local storage:", error);
      return [];
    }
  }

  // Initialize with demo drivers if none exist
  async initializeDemoDrivers(): Promise<void> {
    try {
      const drivers = this.getStoredDrivers();
      
      // Check if demo drivers already exist
      const hasOwnerDemo = Object.values(drivers).some(d => d.email === "rajesh.driver@uride.com");
      const hasFleetDemo = Object.values(drivers).some(d => d.email === "amit.fleet@uride.com");

      if (hasOwnerDemo && hasFleetDemo) {
        console.log("✅ Demo drivers already exist in local storage");
        return;
      }

      console.log("🔧 Initializing demo drivers in local storage...");

      if (!hasOwnerDemo) {
        const ownerDriver: LocalStorageDriver = {
          id: "demo_owner_local",
          name: "Rajesh Kumar",
          email: "rajesh.driver@uride.com",
          phone: "+91 99999 12345",
          driverType: {
            type: "owner",
            commissionRate: 0.05,
          },
          status: "active",
          rating: 4.8,
          totalRides: 487,
          totalEarnings: 42180,
          totalKmDriven: 1890,
          joinDate: new Date("2024-01-15").toISOString(),
          vehicleNumber: "DL 01 AB 1234",
          vehicleModel: "Honda City 2022",
          licenseNumber: "DL1420110012345",
          licenseExpiry: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString(),
          documentsVerified: true,
          idProofType: "aadhar",
          idProofNumber: "1234-5678-9012",
          hasCleanRecord: true,
          backgroundCheckCompleted: true,
          acceptanceRate: 92,
          completionRate: 98,
          averageRating: 4.8,
          onlineHours: 250,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        drivers[ownerDriver.id] = ownerDriver;
      }

      if (!hasFleetDemo) {
        const fleetDriver: LocalStorageDriver = {
          id: "demo_fleet_local",
          name: "Amit Singh",
          email: "amit.fleet@uride.com",
          phone: "+91 88888 12345",
          driverType: {
            type: "fleet",
            salaryPerKm: 12,
          },
          status: "active",
          rating: 4.7,
          totalRides: 392,
          totalEarnings: 28450,
          totalKmDriven: 2025,
          joinDate: new Date("2024-02-20").toISOString(),
          vehicleModel: "URide Fleet Vehicle",
          licenseNumber: "DL1420110054321",
          licenseExpiry: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString(),
          documentsVerified: true,
          idProofType: "aadhar",
          idProofNumber: "9876-5432-1098",
          hasCleanRecord: true,
          backgroundCheckCompleted: true,
          acceptanceRate: 89,
          completionRate: 95,
          averageRating: 4.7,
          onlineHours: 180,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        drivers[fleetDriver.id] = fleetDriver;
      }

      this.saveDrivers(drivers);
      console.log("✅ Demo drivers initialized in local storage");
    } catch (error) {
      console.error("Error initializing demo drivers:", error);
    }
  }

  // Store ride data when a driver completes a ride
  async recordRide(driverId: string, rideData: any): Promise<void> {
    try {
      const rides = this.getStoredRides();
      const rideId = `local_ride_${Date.now()}`;
      
      rides[rideId] = {
        id: rideId,
        driverId,
        ...rideData,
        createdAt: new Date().toISOString(),
      };

      this.saveRides(rides);
      
      // Update driver stats
      await this.updateDriverStats(driverId, rideData);
      
      console.log(`✅ Ride recorded locally: ${rideId}`);
    } catch (error) {
      console.error("Error recording ride:", error);
      throw error;
    }
  }

  async updateDriverStats(driverId: string, rideData: { earnings: number; distance: number; rating: number }): Promise<void> {
    try {
      const drivers = this.getStoredDrivers();
      const driver = drivers[driverId];
      
      if (!driver) return;

      const newTotalRides = driver.totalRides + 1;
      const newTotalEarnings = driver.totalEarnings + rideData.earnings;
      const newTotalKmDriven = driver.totalKmDriven + rideData.distance;
      const newAverageRating = (driver.averageRating * driver.totalRides + rideData.rating) / newTotalRides;

      driver.totalRides = newTotalRides;
      driver.totalEarnings = newTotalEarnings;
      driver.totalKmDriven = newTotalKmDriven;
      driver.averageRating = Number(newAverageRating.toFixed(1));
      driver.rating = driver.averageRating;
      driver.updatedAt = new Date().toISOString();

      this.saveDrivers(drivers);
      console.log(`✅ Driver stats updated locally: ${driverId}`);
    } catch (error) {
      console.error("Error updating driver stats:", error);
    }
  }

  // Private helper methods
  private getStoredDrivers(): Record<string, LocalStorageDriver> {
    try {
      const stored = localStorage.getItem(this.DRIVERS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error("Error reading drivers from localStorage:", error);
      return {};
    }
  }

  private saveDrivers(drivers: Record<string, LocalStorageDriver>): void {
    try {
      localStorage.setItem(this.DRIVERS_KEY, JSON.stringify(drivers));
    } catch (error) {
      console.error("Error saving drivers to localStorage:", error);
    }
  }

  private getStoredRides(): Record<string, any> {
    try {
      const stored = localStorage.getItem(this.RIDES_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error("Error reading rides from localStorage:", error);
      return {};
    }
  }

  private saveRides(rides: Record<string, any>): void {
    try {
      localStorage.setItem(this.RIDES_KEY, JSON.stringify(rides));
    } catch (error) {
      console.error("Error saving rides to localStorage:", error);
    }
  }

  private convertToFirebaseDriver(localDriver: LocalStorageDriver): FirebaseDriver {
    return {
      ...localDriver,
      joinDate: { toDate: () => new Date(localDriver.joinDate) } as any,
      licenseExpiry: { toDate: () => new Date(localDriver.licenseExpiry) } as any,
      createdAt: { toDate: () => new Date(localDriver.createdAt) } as any,
      updatedAt: { toDate: () => new Date(localDriver.updatedAt) } as any,
      currentShift: localDriver.currentShift ? {
        ...localDriver.currentShift,
        startTime: { toDate: () => new Date(localDriver.currentShift!.startTime) } as any,
      } : undefined,
    };
  }

  // Check if we have any stored data
  hasStoredData(): boolean {
    const drivers = this.getStoredDrivers();
    return Object.keys(drivers).length > 0;
  }

  // Clear all local data (for testing)
  clearAllData(): void {
    localStorage.removeItem(this.DRIVERS_KEY);
    localStorage.removeItem(this.RIDES_KEY);
    localStorage.removeItem(this.VEHICLES_KEY);
    console.log("🧹 All local driver data cleared");
  }
}

export const localDatabaseService = new LocalDatabaseService();
