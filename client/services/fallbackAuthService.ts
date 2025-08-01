// Fallback authentication service for development when Supabase is unavailable
import { localDatabaseService } from "./localDatabase";
import type { FirebaseDriver } from "@/shared/driverTypes";

interface FallbackUser {
  uid: string;
  email: string;
  getIdToken: () => Promise<string>;
}

class FallbackAuthService {
  private mockUsers: Map<string, { password: string; driver: FirebaseDriver }> =
    new Map();
  private currentUser: FallbackUser | null = null;

  constructor() {
    // Initialize demo users
    this.initializeDemoUsers();
  }

  private initializeDemoUsers() {
    const demoUsers = [
      {
        email: "driver1@example.com",
        password: "password123",
        driver: {
          id: "demo-driver-1",
          email: "driver1@example.com",
          fullName: "John Doe",
          phoneNumber: "+1-234-567-8901",
          licenseNumber: "DL123456789",
          vehicleInfo: {
            make: "Toyota",
            model: "Camry",
            year: 2020,
            color: "Blue",
            licensePlate: "ABC-123"
          },
          isApproved: true,
          isActive: true,
          rating: 4.8,
          totalRides: 150,
          status: "online" as const,
          currentLocation: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as FirebaseDriver,
      },
      {
        email: "driver2@example.com",
        password: "password123",
        driver: {
          id: "demo-driver-2",
          email: "driver2@example.com",
          fullName: "Jane Smith",
          phoneNumber: "+1-234-567-8902",
          licenseNumber: "DL987654321",
          vehicleInfo: {
            make: "Honda",
            model: "Civic",
            year: 2021,
            color: "Red",
            licensePlate: "XYZ-789"
          },
          isApproved: true,
          isActive: true,
          rating: 4.9,
          totalRides: 200,
          status: "offline" as const,
          currentLocation: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as FirebaseDriver,
      },
    ];

    for (const user of demoUsers) {
      this.mockUsers.set(user.email, {
        password: user.password,
        driver: user.driver,
      });
    }

    console.log("✅ Fallback auth demo users initialized");
  }

  async signInWithEmailAndPassword(
    email: string,
    password: string
  ): Promise<{ user: FallbackUser; driver?: FirebaseDriver }> {
    const userData = this.mockUsers.get(email);

    if (!userData || userData.password !== password) {
      const error = new Error("Invalid email or password");
      (error as any).code = "auth/user-not-found";
      throw error;
    }

    this.currentUser = {
      uid: userData.driver.id,
      email,
      getIdToken: async () => `fallback-token-${userData.driver.id}`,
    };

    // Store in local database
    await localDatabaseService.storeDriverData(userData.driver);

    return { user: this.currentUser, driver: userData.driver };
  }

  async createUserWithEmailAndPassword(
    email: string,
    password: string
  ): Promise<{ user: FallbackUser }> {
    if (this.mockUsers.has(email)) {
      const error = new Error("Email already in use");
      (error as any).code = "auth/email-already-in-use";
      throw error;
    }

    const newUser = {
      uid: `fallback-user-${Date.now()}`,
      email,
      getIdToken: async () => `fallback-token-${Date.now()}`,
    };

    this.currentUser = newUser;
    return { user: newUser };
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
  }

  getCurrentUser(): FallbackUser | null {
    return this.currentUser;
  }

  async getDriverByEmail(email: string): Promise<FirebaseDriver | null> {
    const userData = this.mockUsers.get(email);
    if (userData) {
      return userData.driver;
    }

    // Try to get from local database
    return await localDatabaseService.getDriverByEmail(email);
  }

  async createDriver(driverData: Omit<FirebaseDriver, "id" | "createdAt" | "updatedAt">): Promise<string> {
    return await localDatabaseService.createDriver(driverData);
  }
}

export const fallbackAuthService = new FallbackAuthService();
