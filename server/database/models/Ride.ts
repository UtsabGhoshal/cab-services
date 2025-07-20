import mongoose, { Schema, Document } from "mongoose";

export interface IRide extends Document {
  id: string;
  userId: mongoose.Types.ObjectId;
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

const RideSchema: Schema<IRide> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    from: {
      type: String,
      required: [true, "Pickup location is required"],
      trim: true,
      maxlength: [100, "Pickup location cannot exceed 100 characters"],
    },
    to: {
      type: String,
      required: [true, "Destination is required"],
      trim: true,
      maxlength: [100, "Destination cannot exceed 100 characters"],
    },
    date: {
      type: Date,
      required: [true, "Ride date is required"],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Ride amount is required"],
      min: [0, "Amount cannot be negative"],
      validate: {
        validator: function (value: number) {
          return Number.isFinite(value) && value >= 0;
        },
        message: "Amount must be a valid positive number",
      },
    },
    status: {
      type: String,
      enum: {
        values: ["Completed", "Cancelled", "In Progress"],
        message: "Status must be Completed, Cancelled, or In Progress",
      },
      default: "In Progress",
      index: true,
    },
    driverName: {
      type: String,
      required: [true, "Driver name is required"],
      trim: true,
      maxlength: [50, "Driver name cannot exceed 50 characters"],
    },
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
      validate: {
        validator: function (value: number) {
          return Number.isInteger(value) && value >= 1 && value <= 5;
        },
        message: "Rating must be an integer between 1 and 5",
      },
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      enum: {
        values: ["Card", "Cash", "Digital Wallet"],
        message: "Payment method must be Card, Cash, or Digital Wallet",
      },
    },
    duration: {
      type: Number,
      min: [1, "Duration must be at least 1 minute"],
      validate: {
        validator: function (value: number) {
          return !value || (Number.isInteger(value) && value > 0);
        },
        message: "Duration must be a positive integer (minutes)",
      },
    },
    distance: {
      type: Number,
      min: [0.1, "Distance must be at least 0.1 km"],
      validate: {
        validator: function (value: number) {
          return !value || (Number.isFinite(value) && value > 0);
        },
        message: "Distance must be a positive number (kilometers)",
      },
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
RideSchema.index({ userId: 1, date: -1 }); // User rides sorted by date
RideSchema.index({ status: 1, date: -1 }); // Rides by status and date
RideSchema.index({ date: -1 }); // Recent rides
RideSchema.index({ userId: 1, status: 1 }); // User rides by status

// Static methods for common queries
RideSchema.statics.findByUserId = function (
  userId: string,
  limit: number = 10,
) {
  return this.find({ userId })
    .sort({ date: -1 })
    .limit(limit)
    .populate("userId", "name email");
};

RideSchema.statics.findRecentByUserId = function (
  userId: string,
  limit: number = 5,
) {
  return this.find({ userId, status: "Completed" })
    .sort({ date: -1 })
    .limit(limit);
};

RideSchema.statics.getUserStats = async function (userId: string) {
  const stats = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalRides: { $sum: 1 },
        totalSpent: { $sum: "$amount" },
        averageRating: { $avg: "$rating" },
        completedRides: {
          $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] },
        },
      },
    },
  ]);

  return (
    stats[0] || {
      totalRides: 0,
      totalSpent: 0,
      averageRating: 0,
      completedRides: 0,
    }
  );
};

export const Ride = mongoose.model<IRide>("Ride", RideSchema);
