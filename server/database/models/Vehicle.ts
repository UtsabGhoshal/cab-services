import mongoose, { Schema, Document } from "mongoose";

export interface IVehicle extends Document {
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
  assignedAt?: Date;
  
  // Maintenance and Service
  mileage: number;
  lastService: Date;
  nextServiceDue: Date;
  maintenanceHistory: {
    date: Date;
    type: string;
    cost: number;
    description: string;
    serviceCenter?: string;
  }[];
  
  // Documents
  insuranceExpiry: Date;
  registrationExpiry: Date;
  pollutionCertExpiry: Date;
  
  // Document URLs
  registrationDocumentUrl?: string;
  insuranceDocumentUrl?: string;
  pollutionCertUrl?: string;
  
  // Vehicle Specifications
  fuelType: "petrol" | "diesel" | "cng" | "electric";
  transmission: "manual" | "automatic";
  seatingCapacity: number;
  engineCapacity?: number; // in CC
  
  // Operational Data
  totalTrips: number;
  totalKmDriven: number;
  totalEarnings: number;
  averageFuelEfficiency?: number; // km per liter
  
  // Location and Tracking
  lastKnownLocation?: {
    lat: number;
    lng: number;
    address?: string;
    timestamp: Date;
  };
  
  // Financial
  purchasePrice?: number;
  purchaseDate?: Date;
  depreciationRate?: number;
  
  // Status tracking
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  assignToDriver(driverId: string, driverName: string): Promise<void>;
  unassign(): Promise<void>;
  scheduleService(date: Date, type: string): Promise<void>;
  updateMileage(newMileage: number): Promise<void>;
  addMaintenanceRecord(record: {
    type: string;
    cost: number;
    description: string;
    serviceCenter?: string;
  }): Promise<void>;
}

const MaintenanceRecordSchema = new Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    required: true,
    enum: ["routine", "repair", "inspection", "breakdown", "accident"],
  },
  cost: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    required: true,
    maxlength: 500,
  },
  serviceCenter: {
    type: String,
    maxlength: 200,
  },
}, { _id: true });

const LocationSchema = new Schema({
  lat: {
    type: Number,
    required: true,
    min: -90,
    max: 90,
  },
  lng: {
    type: Number,
    required: true,
    min: -180,
    max: 180,
  },
  address: {
    type: String,
    maxlength: 300,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const VehicleSchema: Schema<IVehicle> = new Schema(
  {
    make: {
      type: String,
      required: [true, "Vehicle make is required"],
      trim: true,
      maxlength: [50, "Make cannot exceed 50 characters"],
    },
    model: {
      type: String,
      required: [true, "Vehicle model is required"],
      trim: true,
      maxlength: [50, "Model cannot exceed 50 characters"],
    },
    year: {
      type: Number,
      required: [true, "Manufacturing year is required"],
      min: [2010, "Vehicle must be 2010 or newer"],
      max: [new Date().getFullYear() + 1, "Invalid year"],
    },
    color: {
      type: String,
      required: [true, "Vehicle color is required"],
      trim: true,
      maxlength: [30, "Color cannot exceed 30 characters"],
    },
    registrationNumber: {
      type: String,
      required: [true, "Registration number is required"],
      unique: true,
      uppercase: true,
      trim: true,
      match: [
        /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/,
        "Please provide a valid registration number",
      ],
    },
    type: {
      type: String,
      enum: ["company", "driver_owned"],
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "assigned", "maintenance"],
      default: "available",
    },
    
    // Assignment
    assignedDriverId: {
      type: String,
      sparse: true,
    },
    assignedDriverName: {
      type: String,
      maxlength: 100,
    },
    assignedAt: Date,
    
    // Maintenance and Service
    mileage: {
      type: Number,
      required: [true, "Current mileage is required"],
      min: 0,
    },
    lastService: {
      type: Date,
      required: [true, "Last service date is required"],
    },
    nextServiceDue: {
      type: Date,
      required: [true, "Next service due date is required"],
    },
    maintenanceHistory: [MaintenanceRecordSchema],
    
    // Documents
    insuranceExpiry: {
      type: Date,
      required: [true, "Insurance expiry date is required"],
      validate: {
        validator: function(date: Date) {
          return date > new Date();
        },
        message: "Insurance must not be expired",
      },
    },
    registrationExpiry: {
      type: Date,
      required: [true, "Registration expiry date is required"],
      validate: {
        validator: function(date: Date) {
          return date > new Date();
        },
        message: "Registration must not be expired",
      },
    },
    pollutionCertExpiry: {
      type: Date,
      required: [true, "Pollution certificate expiry date is required"],
      validate: {
        validator: function(date: Date) {
          return date > new Date();
        },
        message: "Pollution certificate must not be expired",
      },
    },
    
    // Document URLs
    registrationDocumentUrl: String,
    insuranceDocumentUrl: String,
    pollutionCertUrl: String,
    
    // Vehicle Specifications
    fuelType: {
      type: String,
      enum: ["petrol", "diesel", "cng", "electric"],
      required: true,
      default: "petrol",
    },
    transmission: {
      type: String,
      enum: ["manual", "automatic"],
      required: true,
      default: "manual",
    },
    seatingCapacity: {
      type: Number,
      required: true,
      min: 2,
      max: 8,
      default: 4,
    },
    engineCapacity: {
      type: Number,
      min: 800,
      max: 5000,
    },
    
    // Operational Data
    totalTrips: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalKmDriven: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      min: 0,
      default: 0,
    },
    averageFuelEfficiency: {
      type: Number,
      min: 5,
      max: 40,
    },
    
    // Location and Tracking
    lastKnownLocation: LocationSchema,
    
    // Financial
    purchasePrice: {
      type: Number,
      min: 0,
    },
    purchaseDate: Date,
    depreciationRate: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.15, // 15% per year
    },
    
    // Status tracking
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Indexes for better query performance
VehicleSchema.index({ registrationNumber: 1 });
VehicleSchema.index({ type: 1, status: 1 });
VehicleSchema.index({ assignedDriverId: 1 });
VehicleSchema.index({ status: 1 });
VehicleSchema.index({ nextServiceDue: 1 });
VehicleSchema.index({ insuranceExpiry: 1 });
VehicleSchema.index({ registrationExpiry: 1 });
VehicleSchema.index({ pollutionCertExpiry: 1 });
VehicleSchema.index({ isActive: 1 });
VehicleSchema.index({ createdAt: -1 });

// Middleware to update next service due date based on mileage
VehicleSchema.pre<IVehicle>("save", function (next) {
  if (this.isModified("mileage") || this.isModified("lastService")) {
    // Calculate next service due (every 10,000 km or 6 months, whichever comes first)
    const nextServiceByKm = Math.ceil(this.mileage / 10000) * 10000;
    const nextServiceByDate = new Date(this.lastService);
    nextServiceByDate.setMonth(nextServiceByDate.getMonth() + 6);
    
    // Use the earlier of the two dates
    const nextServiceByKmDate = new Date();
    nextServiceByKmDate.setDate(nextServiceByKmDate.getDate() + 
      Math.max(0, (nextServiceByKm - this.mileage) * 0.5)); // Assume 2 km per day average
    
    this.nextServiceDue = nextServiceByKmDate < nextServiceByDate ? 
      nextServiceByKmDate : nextServiceByDate;
  }
  next();
});

// Method to assign vehicle to driver
VehicleSchema.methods.assignToDriver = async function (
  driverId: string, 
  driverName: string
): Promise<void> {
  if (this.status !== "available") {
    throw new Error("Vehicle is not available for assignment");
  }

  this.assignedDriverId = driverId;
  this.assignedDriverName = driverName;
  this.assignedAt = new Date();
  this.status = "assigned";

  await this.save();
};

// Method to unassign vehicle
VehicleSchema.methods.unassign = async function (): Promise<void> {
  this.assignedDriverId = undefined;
  this.assignedDriverName = undefined;
  this.assignedAt = undefined;
  this.status = "available";

  await this.save();
};

// Method to schedule service
VehicleSchema.methods.scheduleService = async function (
  date: Date, 
  type: string
): Promise<void> {
  this.nextServiceDue = date;
  this.status = "maintenance";

  // Add to maintenance history
  this.maintenanceHistory.push({
    date: new Date(),
    type: "scheduled",
    cost: 0, // Will be updated when service is completed
    description: `Scheduled ${type} service`,
  });

  await this.save();
};

// Method to update mileage
VehicleSchema.methods.updateMileage = async function (newMileage: number): Promise<void> {
  if (newMileage < this.mileage) {
    throw new Error("New mileage cannot be less than current mileage");
  }

  const kmDriven = newMileage - this.mileage;
  this.mileage = newMileage;
  this.totalKmDriven += kmDriven;

  await this.save();
};

// Method to add maintenance record
VehicleSchema.methods.addMaintenanceRecord = async function (record: {
  type: string;
  cost: number;
  description: string;
  serviceCenter?: string;
}): Promise<void> {
  this.maintenanceHistory.push({
    date: new Date(),
    ...record,
  });

  // If this was a service, update lastService date and set status back to available
  if (record.type === "routine" || record.type === "inspection") {
    this.lastService = new Date();
    if (this.status === "maintenance") {
      this.status = this.assignedDriverId ? "assigned" : "available";
    }
  }

  await this.save();
};

// Static methods
VehicleSchema.statics.findAvailableCompanyVehicles = function () {
  return this.find({
    type: "company",
    status: "available",
    isActive: true,
  });
};

VehicleSchema.statics.findByDriver = function (driverId: string) {
  return this.findOne({
    assignedDriverId: driverId,
    isActive: true,
  });
};

VehicleSchema.statics.findDueForService = function () {
  return this.find({
    nextServiceDue: { $lte: new Date() },
    isActive: true,
  });
};

VehicleSchema.statics.findExpiringDocuments = function (days: number = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    $or: [
      { insuranceExpiry: { $lte: futureDate } },
      { registrationExpiry: { $lte: futureDate } },
      { pollutionCertExpiry: { $lte: futureDate } },
    ],
    isActive: true,
  });
};

VehicleSchema.statics.getFleetStatistics = function () {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalVehicles: { $sum: 1 },
        companyVehicles: {
          $sum: { $cond: [{ $eq: ["$type", "company"] }, 1, 0] }
        },
        driverOwnedVehicles: {
          $sum: { $cond: [{ $eq: ["$type", "driver_owned"] }, 1, 0] }
        },
        availableVehicles: {
          $sum: { $cond: [{ $eq: ["$status", "available"] }, 1, 0] }
        },
        assignedVehicles: {
          $sum: { $cond: [{ $eq: ["$status", "assigned"] }, 1, 0] }
        },
        maintenanceVehicles: {
          $sum: { $cond: [{ $eq: ["$status", "maintenance"] }, 1, 0] }
        },
        totalKmDriven: { $sum: "$totalKmDriven" },
        totalEarnings: { $sum: "$totalEarnings" },
        averageAge: {
          $avg: { $subtract: [new Date().getFullYear(), "$year"] }
        },
      }
    }
  ]);
};

export const Vehicle = mongoose.model<IVehicle>("Vehicle", VehicleSchema);
