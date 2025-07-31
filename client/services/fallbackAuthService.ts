// Fallback authentication service for development when Firebase is unavailable
import { firebaseDriverService, type FirebaseDriver } from './firebaseDriverService';
import { Timestamp } from 'firebase/firestore';

interface FallbackUser {
  uid: string;
  email: string;
  getIdToken: () => Promise<string>;
}

class FallbackAuthService {
  private mockUsers: Map<string, { password: string; driver: FirebaseDriver }> = new Map();
  private currentUser: FallbackUser | null = null;

  constructor() {
    // Initialize demo users
    this.initializeDemoUsers();
  }

  private initializeDemoUsers() {
    // Demo owner driver
    const ownerDriver: FirebaseDriver = {
      id: "demo_owner_123",
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
      joinDate: Timestamp.now(),
      vehicleNumber: "DL 01 AB 1234",
      vehicleModel: "Honda City 2022",
      licenseNumber: "DL1420110012345",
      documentsVerified: true,
      idProofType: "aadhar",
      idProofNumber: "1234-5678-9012",
      hasCleanRecord: true,
      backgroundCheckCompleted: true,
      acceptanceRate: 92,
      completionRate: 98,
      averageRating: 4.8,
      onlineHours: 250,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Demo fleet driver
    const fleetDriver: FirebaseDriver = {
      id: "demo_fleet_456",
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
      joinDate: Timestamp.now(),
      vehicleModel: "URide Fleet Vehicle",
      licenseNumber: "DL1420110054321",
      documentsVerified: true,
      idProofType: "aadhar", 
      idProofNumber: "9876-5432-1098",
      hasCleanRecord: true,
      backgroundCheckCompleted: true,
      acceptanceRate: 89,
      completionRate: 95,
      averageRating: 4.7,
      onlineHours: 180,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    this.mockUsers.set("rajesh.driver@uride.com", { password: "demo123", driver: ownerDriver });
    this.mockUsers.set("amit.fleet@uride.com", { password: "demo123", driver: fleetDriver });
  }

  async createUserWithEmailAndPassword(email: string, password: string): Promise<{ user: FallbackUser }> {
    // Simulate Firebase user creation
    await this.delay(500); // Simulate network delay

    if (this.mockUsers.has(email)) {
      throw new Error("auth/email-already-in-use");
    }

    const user: FallbackUser = {
      uid: `fallback_${Date.now()}`,
      email,
      getIdToken: async () => `fallback_token_${Date.now()}`,
    };

    this.currentUser = user;
    return { user };
  }

  async signInWithEmailAndPassword(email: string, password: string): Promise<{ user: FallbackUser }> {
    await this.delay(500); // Simulate network delay

    const userData = this.mockUsers.get(email);
    if (!userData || userData.password !== password) {
      throw new Error("auth/user-not-found");
    }

    const user: FallbackUser = {
      uid: `fallback_${userData.driver.id}`,
      email,
      getIdToken: async () => `fallback_token_${Date.now()}`,
    };

    this.currentUser = user;
    return { user };
  }

  async signOut(): Promise<void> {
    await this.delay(200);
    this.currentUser = null;
  }

  getCurrentUser(): FallbackUser | null {
    return this.currentUser;
  }

  // Mock driver service methods
  async getDriverByEmail(email: string): Promise<FirebaseDriver | null> {
    await this.delay(300);
    const userData = this.mockUsers.get(email);
    return userData ? userData.driver : null;
  }

  async createDriver(driverData: Omit<FirebaseDriver, "id" | "createdAt" | "updatedAt">): Promise<string> {
    await this.delay(500);
    const id = `fallback_driver_${Date.now()}`;
    
    const driver: FirebaseDriver = {
      ...driverData,
      id,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    this.mockUsers.set(driverData.email, { password: "temp123", driver });
    return id;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const fallbackAuthService = new FallbackAuthService();
