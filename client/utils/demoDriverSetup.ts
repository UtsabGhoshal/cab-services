import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/config";
import { firebaseDriverService, type FirebaseDriver } from "@/services/firebaseDriverService";
import { Timestamp } from "firebase/firestore";

export const createDemoDriversIfNeeded = async (): Promise<void> => {
  try {
    const demoDrivers = [
      {
        email: "rajesh.driver@uride.com",
        password: "demo123",
        driverData: {
          name: "Rajesh Kumar",
          email: "rajesh.driver@uride.com",
          phone: "+91 99999 12345",
          driverType: {
            type: "owner" as const,
            commissionRate: 0.05,
          },
          status: "active" as const,
          rating: 4.8,
          totalRides: 487,
          totalEarnings: 42180,
          totalKmDriven: 1890,
          joinDate: Timestamp.now(),
          vehicleNumber: "DL 01 AB 1234",
          vehicleModel: "Honda City 2022",
          licenseNumber: "DL1420110012345",
          licenseExpiry: Timestamp.fromDate(new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000)), // 5 years
          documentsVerified: true,
          idProofType: "aadhar" as const,
          idProofNumber: "1234-5678-9012",
          hasCleanRecord: true,
          backgroundCheckCompleted: true,
          acceptanceRate: 92,
          completionRate: 98,
          averageRating: 4.8,
          onlineHours: 250,
        } as Omit<FirebaseDriver, "id" | "createdAt" | "updatedAt">,
      },
      {
        email: "amit.fleet@uride.com",
        password: "demo123",
        driverData: {
          name: "Amit Singh",
          email: "amit.fleet@uride.com",
          phone: "+91 88888 12345",
          driverType: {
            type: "fleet" as const,
            salaryPerKm: 12,
          },
          status: "active" as const,
          rating: 4.7,
          totalRides: 392,
          totalEarnings: 28450,
          totalKmDriven: 2025,
          joinDate: Timestamp.now(),
          vehicleModel: "URide Fleet Vehicle",
          licenseNumber: "DL1420110054321",
          licenseExpiry: Timestamp.fromDate(new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000)), // 5 years
          documentsVerified: true,
          idProofType: "aadhar" as const,
          idProofNumber: "9876-5432-1098",
          hasCleanRecord: true,
          backgroundCheckCompleted: true,
          acceptanceRate: 89,
          completionRate: 95,
          averageRating: 4.7,
          onlineHours: 180,
        } as Omit<FirebaseDriver, "id" | "createdAt" | "updatedAt">,
      },
    ];

    for (const demo of demoDrivers) {
      try {
        // Check if driver already exists
        const existingDriver = await firebaseDriverService.getDriverByEmail(demo.email);
        
        if (!existingDriver) {
          console.log(`Creating demo driver: ${demo.email}`);
          
          // Create Firebase Auth user
          try {
            await createUserWithEmailAndPassword(auth, demo.email, demo.password);
            console.log(`Firebase Auth user created for: ${demo.email}`);
          } catch (authError: any) {
            if (authError.code === "auth/email-already-in-use") {
              console.log(`Firebase Auth user already exists for: ${demo.email}`);
            } else {
              console.warn(`Failed to create Firebase Auth user for ${demo.email}:`, authError.message);
            }
          }
          
          // Create driver profile
          await firebaseDriverService.createDriver(demo.driverData);
          console.log(`Demo driver profile created for: ${demo.email}`);
        } else {
          console.log(`Demo driver already exists: ${demo.email}`);
        }
      } catch (error) {
        console.error(`Error setting up demo driver ${demo.email}:`, error);
      }
    }
  } catch (error) {
    console.error("Error setting up demo drivers:", error);
  }
};
