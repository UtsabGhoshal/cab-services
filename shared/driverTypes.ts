// Shared types for the URide driver system

export interface DriverType {
  type: "owner" | "fleet";
  vehicleId?: string;
  commissionRate?: number; // For vehicle owners (e.g., 0.05 for 5%)
  salaryPerKm?: number; // For fleet drivers (e.g., 12 for ₹12/km)
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  driverType: DriverType;
  status: "active" | "inactive" | "pending";
  rating: number;
  totalRides: number;
  totalEarnings: number;
  totalKmDriven: number;
  joinDate: Date;

  // Vehicle Information
  vehicleNumber?: string; // For vehicle owners
  vehicleModel?: string; // For vehicle owners
  assignedVehicleId?: string; // For fleet drivers

  // License and Documents
  licenseNumber: string;
  licenseExpiry: Date;
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
    startTime: Date;
    targetKm?: number;
    completedKm?: number;
    isActive: boolean;
  };
}

export interface Vehicle {
  id: string;
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
  lastService: Date;
  nextServiceDue: Date;

  // Documents
  insuranceExpiry: Date;
  registrationExpiry: Date;
  pollutionCertExpiry: Date;
}

export interface Ride {
  id: string;
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
  status:
    | "requested"
    | "accepted"
    | "picking_up"
    | "en_route"
    | "completed"
    | "cancelled";

  // Financial details
  totalFare: number;
  driverEarnings: number;
  commission?: number; // For vehicle owners
  kmSalary?: number; // For fleet drivers

  // Timestamps
  requestedAt: Date;
  acceptedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;

  // Ratings
  passengerRating?: number;
  driverRating?: number;
}

export interface DriverStats {
  // Earnings
  totalEarnings: number;
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;

  // Commission/Salary breakdown
  totalCommissionPaid?: number; // For vehicle owners
  totalKmSalary?: number; // For fleet drivers

  // Rides
  totalRides: number;
  todayRides: number;
  totalKmDriven: number;
  todayKmDriven: number;

  // Performance
  averageRating: number;
  onlineHours: number;
  acceptanceRate: number;
  completionRate: number;

  // Goals
  monthlyTarget?: number;
  targetProgress?: number;
}

export interface DriverSignupData {
  // Personal Information
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;

  // Driver License Information
  licenseNumber: string;
  licenseExpiry: string;
  licenseDocument: File | null;

  // Vehicle Information (if owns car)
  hasVehicle: "yes" | "no" | "";
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  vehicleNumber: string;
  registrationDocument: File | null;
  insuranceDocument: File | null;

  // ID Verification
  idProofType: "aadhar" | "passport" | "voter" | "";
  idProofNumber: string;
  idProofDocument: File | null;

  // Background Check
  hasCleanRecord: boolean;
  backgroundCheckConsent: boolean;

  // Terms
  acceptTerms: boolean;
  acceptPrivacyPolicy: boolean;
}

export interface CommissionSettings {
  vehicleOwnerRate: number; // Percentage (e.g., 5 for 5%)
  fleetDriverSalaryRate: number; // Per km (e.g., 12 for ₹12/km)
  platformFee: number; // Percentage
  bonusThresholds: {
    rides: number;
    bonus: number;
  }[];
}

export interface AdminDashboardStats {
  totalDrivers: number;
  activeDrivers: number;
  pendingApprovals: number;
  totalVehicles: number;
  availableVehicles: number;
  totalRevenue: number;
  monthlyCommission: number;
}

// API Response types
export interface DriverLoginResponse {
  success: boolean;
  driver?: Driver;
  token?: string;
  error?: string;
}

export interface DriverSignupResponse {
  success: boolean;
  driverId?: string;
  message?: string;
  error?: string;
}

export interface RideRequestResponse {
  success: boolean;
  ride?: Ride;
  error?: string;
}

export interface DriverEarningsCalculation {
  totalFare: number;
  driverEarnings: number;
  commission?: number; // For vehicle owners
  kmSalary?: number; // For fleet drivers
  breakdown: {
    baseFare: number;
    distanceFare: number;
    timeFare: number;
    surge?: number;
    taxes: number;
  };
}

// Validation schemas (for use with Zod or similar)
export const DriverTypeSchema = {
  type: ["owner", "fleet"] as const,
  commissionRate: "number", // 0 to 0.2 (0% to 20%)
  salaryPerKm: "number", // 5 to 30 (₹5 to ₹30 per km)
};

export const DriverStatusSchema = ["active", "inactive", "pending"] as const;
export const VehicleStatusSchema = [
  "available",
  "assigned",
  "maintenance",
] as const;
export const RideStatusSchema = [
  "requested",
  "accepted",
  "picking_up",
  "en_route",
  "completed",
  "cancelled",
] as const;
export const RideTypeSchema = ["economy", "premium", "luxury"] as const;
export const IDProofTypeSchema = ["aadhar", "passport", "voter"] as const;

// Utility functions
export function calculateDriverEarnings(
  totalFare: number,
  distance: number,
  driverType: DriverType,
): DriverEarningsCalculation {
  const breakdown = {
    baseFare: totalFare * 0.3, // 30% base fare
    distanceFare: totalFare * 0.5, // 50% distance fare
    timeFare: totalFare * 0.15, // 15% time fare
    taxes: totalFare * 0.05, // 5% taxes
  };

  if (driverType.type === "owner") {
    const commission = totalFare * (driverType.commissionRate || 0.05);
    return {
      totalFare,
      driverEarnings: totalFare - commission,
      commission,
      breakdown,
    };
  } else {
    const kmSalary = distance * (driverType.salaryPerKm || 12);
    return {
      totalFare,
      driverEarnings: kmSalary,
      kmSalary,
      breakdown,
    };
  }
}

export function getDriverTypeBadge(type: "owner" | "fleet"): {
  label: string;
  color: string;
  icon: string;
} {
  switch (type) {
    case "owner":
      return {
        label: "Vehicle Owner",
        color: "yellow",
        icon: "crown",
      };
    case "fleet":
      return {
        label: "Fleet Driver",
        color: "blue",
        icon: "building",
      };
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "active":
    case "available":
      return "bg-green-100 text-green-800";
    case "inactive":
      return "bg-red-100 text-red-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "assigned":
      return "bg-purple-100 text-purple-800";
    case "maintenance":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function formatEarnings(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatDistance(km: number): string {
  return `${km.toFixed(1)} km`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function formatRating(rating: number): string {
  return `${rating.toFixed(1)}★`;
}

export function calculateShiftProgress(shift?: {
  targetKm?: number;
  completedKm?: number;
}): number {
  if (!shift || !shift.targetKm || !shift.completedKm) return 0;
  return Math.min((shift.completedKm / shift.targetKm) * 100, 100);
}

// Validation helpers
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^(\+91|0)?[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ""));
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidLicenseNumber(license: string): boolean {
  // Indian driving license format: 2 letters + 2 digits + year + 7 digits
  const licenseRegex = /^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/;
  return licenseRegex.test(license.replace(/\s+/g, ""));
}

export function isValidVehicleNumber(vehicleNumber: string): boolean {
  // Indian vehicle number format: 2 letters + 2 digits + 2 letters + 4 digits
  const vehicleRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;
  return vehicleRegex.test(vehicleNumber.replace(/\s+/g, ""));
}
