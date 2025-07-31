import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

interface IDriverType {
  type: "owner" | "fleet";
  vehicleId?: string;
  commissionRate?: number; // For vehicle owners (e.g., 0.05 for 5%)
  salaryPerKm?: number; // For fleet drivers (e.g., 12 for ₹12/km)
}

interface IShift {
  startTime: Date;
  targetKm?: number;
  completedKm?: number;
  isActive: boolean;
}

export interface IDriver extends Document {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  driverType: IDriverType;
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
  licenseDocumentUrl?: string;
  
  // Vehicle Documents (for owners)
  registrationDocumentUrl?: string;
  insuranceDocumentUrl?: string;
  
  // ID Verification
  idProofType?: "aadhar" | "passport" | "voter";
  idProofNumber?: string;
  idProofDocumentUrl?: string;
  
  // Background Check
  hasCleanRecord: boolean;
  backgroundCheckCompleted: boolean;
  backgroundCheckDate?: Date;
  
  // Performance Metrics
  acceptanceRate: number;
  completionRate: number;
  averageRating: number;
  onlineHours: number;
  
  // Shift Information (for fleet drivers)
  currentShift?: IShift;
  
  // Address and Location
  address: string;
  dateOfBirth?: Date;
  
  // Account status
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  lastLogin?: Date;
  lastActive?: Date;
  
  // Terms and Conditions
  acceptedTerms: boolean;
  acceptedPrivacyPolicy: boolean;
  termsAcceptedAt?: Date;
  
  // Created/Updated timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  updateStats(rideData: { earnings: number; distance: number; rating: number }): Promise<void>;
  startShift(targetKm?: number): Promise<void>;
  endShift(): Promise<void>;
}

const DriverTypeSchema = new Schema<IDriverType>({
  type: {
    type: String,
    enum: ["owner", "fleet"],
    required: true,
  },
  vehicleId: {
    type: String,
    sparse: true,
  },
  commissionRate: {
    type: Number,
    min: 0,
    max: 0.3, // Maximum 30%
    default: function(this: IDriverType) {
      return this.type === "owner" ? 0.05 : undefined;
    },
  },
  salaryPerKm: {
    type: Number,
    min: 5,
    max: 50,
    default: function(this: IDriverType) {
      return this.type === "fleet" ? 12 : undefined;
    },
  },
}, { _id: false });

const ShiftSchema = new Schema<IShift>({
  startTime: {
    type: Date,
    required: true,
  },
  targetKm: {
    type: Number,
    min: 10,
    max: 500,
  },
  completedKm: {
    type: Number,
    min: 0,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { _id: false });

const DriverSchema: Schema<IDriver> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      match: [
        /^(\+91|0)?[6-9]\d{9}$/,
        "Please provide a valid Indian phone number",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't include password in queries by default
    },
    driverType: {
      type: DriverTypeSchema,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "pending",
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalRides: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalKmDriven: {
      type: Number,
      min: 0,
      default: 0,
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    
    // Vehicle Information
    vehicleNumber: {
      type: String,
      sparse: true,
      uppercase: true,
      match: [
        /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/,
        "Please provide a valid vehicle number",
      ],
    },
    vehicleModel: {
      type: String,
      maxlength: [100, "Vehicle model cannot exceed 100 characters"],
    },
    assignedVehicleId: {
      type: String,
      sparse: true,
    },
    
    // License and Documents
    licenseNumber: {
      type: String,
      required: [true, "License number is required"],
      unique: true,
      uppercase: true,
      match: [
        /^[A-Z]{2}[0-9]{13}$/,
        "Please provide a valid license number",
      ],
    },
    licenseExpiry: {
      type: Date,
      required: [true, "License expiry date is required"],
      validate: {
        validator: function(date: Date) {
          return date > new Date();
        },
        message: "License must not be expired",
      },
    },
    documentsVerified: {
      type: Boolean,
      default: false,
    },
    licenseDocumentUrl: String,
    registrationDocumentUrl: String,
    insuranceDocumentUrl: String,
    
    // ID Verification
    idProofType: {
      type: String,
      enum: ["aadhar", "passport", "voter"],
    },
    idProofNumber: {
      type: String,
      sparse: true,
    },
    idProofDocumentUrl: String,
    
    // Background Check
    hasCleanRecord: {
      type: Boolean,
      required: true,
    },
    backgroundCheckCompleted: {
      type: Boolean,
      default: false,
    },
    backgroundCheckDate: Date,
    
    // Performance Metrics
    acceptanceRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },
    completionRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    onlineHours: {
      type: Number,
      min: 0,
      default: 0,
    },
    
    // Shift Information
    currentShift: ShiftSchema,
    
    // Address and Personal Info
    address: {
      type: String,
      required: [true, "Address is required"],
      maxlength: [500, "Address cannot exceed 500 characters"],
    },
    dateOfBirth: Date,
    
    // Account status
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: Date,
    lastActive: Date,
    
    // Terms and Conditions
    acceptedTerms: {
      type: Boolean,
      required: true,
    },
    acceptedPrivacyPolicy: {
      type: Boolean,
      required: true,
    },
    termsAcceptedAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  },
);

// Indexes for better query performance
DriverSchema.index({ email: 1 });
DriverSchema.index({ phone: 1 });
DriverSchema.index({ licenseNumber: 1 });
DriverSchema.index({ status: 1 });
DriverSchema.index({ "driverType.type": 1 });
DriverSchema.index({ assignedVehicleId: 1 });
DriverSchema.index({ vehicleNumber: 1 });
DriverSchema.index({ totalEarnings: -1 });
DriverSchema.index({ averageRating: -1 });
DriverSchema.index({ createdAt: -1 });

// Hash password before saving
DriverSchema.pre<IDriver>("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Set terms accepted date when terms are accepted
DriverSchema.pre<IDriver>("save", function (next) {
  if (this.isModified("acceptedTerms") && this.acceptedTerms && !this.termsAcceptedAt) {
    this.termsAcceptedAt = new Date();
  }
  next();
});

// Update lastActive on save
DriverSchema.pre<IDriver>("save", function (next) {
  this.lastActive = new Date();
  next();
});

// Instance method to check password
DriverSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Method to update stats after completing a ride
DriverSchema.methods.updateStats = async function (rideData: {
  earnings: number;
  distance: number;
  rating: number;
}): Promise<void> {
  const newTotalRides = this.totalRides + 1;
  const newTotalEarnings = this.totalEarnings + rideData.earnings;
  const newTotalKmDriven = this.totalKmDriven + rideData.distance;
  
  // Calculate new average rating
  const newAverageRating = 
    ((this.averageRating * this.totalRides) + rideData.rating) / newTotalRides;

  this.totalRides = newTotalRides;
  this.totalEarnings = newTotalEarnings;
  this.totalKmDriven = newTotalKmDriven;
  this.averageRating = Number(newAverageRating.toFixed(1));
  this.rating = this.averageRating; // Update the rating field as well

  await this.save();
};

// Method to start a shift (for fleet drivers)
DriverSchema.methods.startShift = async function (targetKm?: number): Promise<void> {
  if (this.driverType.type !== "fleet") {
    throw new Error("Only fleet drivers can start shifts");
  }

  this.currentShift = {
    startTime: new Date(),
    targetKm: targetKm || 120, // Default target of 120km
    completedKm: 0,
    isActive: true,
  };

  await this.save();
};

// Method to end current shift
DriverSchema.methods.endShift = async function (): Promise<void> {
  if (!this.currentShift || !this.currentShift.isActive) {
    throw new Error("No active shift to end");
  }

  this.currentShift.isActive = false;
  
  // Add to total online hours (estimate based on shift duration)
  const shiftDuration = Date.now() - this.currentShift.startTime.getTime();
  const hoursWorked = shiftDuration / (1000 * 60 * 60); // Convert to hours
  this.onlineHours += hoursWorked;

  await this.save();
};

// Static method to find driver with password for authentication
DriverSchema.statics.findByEmailWithPassword = function (email: string) {
  return this.findOne({ email, status: { $ne: "inactive" } }).select("+password");
};

DriverSchema.statics.findByPhoneWithPassword = function (phone: string) {
  return this.findOne({ phone, status: { $ne: "inactive" } }).select("+password");
};

// Static method to get drivers by type
DriverSchema.statics.findByType = function (type: "owner" | "fleet") {
  return this.find({ "driverType.type": type });
};

// Static method to get active drivers
DriverSchema.statics.findActive = function () {
  return this.find({ status: "active" });
};

// Static method to get drivers pending approval
DriverSchema.statics.findPending = function () {
  return this.find({ status: "pending" });
};

// Static method to get top earners
DriverSchema.statics.findTopEarners = function (limit: number = 10) {
  return this.find({ status: "active" })
    .sort({ totalEarnings: -1 })
    .limit(limit);
};

export const Driver = mongoose.model<IDriver>("Driver", DriverSchema);
