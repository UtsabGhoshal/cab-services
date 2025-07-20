// Database models and types for in-memory data storage

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password: string; // In real app, this would be hashed
  dateOfBirth?: string;
  address?: string;
  joinDate: Date;
  memberLevel: "Bronze" | "Silver" | "Gold" | "Platinum";
  isActive: boolean;
}

export interface Ride {
  id: string;
  userId: string;
  from: string;
  to: string;
  date: Date;
  amount: number;
  status: "Completed" | "Cancelled" | "In Progress";
  driverName: string;
  rating?: number;
  paymentMethod: string;
  duration?: number; // in minutes
  distance?: number; // in kilometers
}

export interface UserStats {
  totalRides: number;
  totalSpent: number;
  averageRating: number;
  memberLevel: string;
  joinDate: Date;
}

// API Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  dateOfBirth?: string;
  address?: string;
}

export interface SignupResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export interface UserDataResponse {
  success: boolean;
  user?: User;
  recentRides?: Ride[];
  stats?: UserStats;
  error?: string;
}
