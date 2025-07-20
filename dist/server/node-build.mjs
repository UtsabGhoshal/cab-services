import path from "path";
import * as express from "express";
import express__default, { Router } from "express";
import cors from "cors";
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
const handleDemo = (req, res) => {
  const response = {
    message: "Hello from Express server"
  };
  res.status(200).json(response);
};
const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address"
      ]
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-\(\)]+$/, "Please provide a valid phone number"]
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false
      // Don't include password in queries by default
    },
    dateOfBirth: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, "Address cannot exceed 200 characters"]
    },
    joinDate: {
      type: Date,
      default: Date.now
    },
    memberLevel: {
      type: String,
      enum: ["Bronze", "Silver", "Gold", "Platinum"],
      default: "Bronze"
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      }
    },
    toObject: {
      transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      }
    }
  }
);
UserSchema.index({ email: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ memberLevel: 1 });
UserSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};
UserSchema.statics.findByEmailWithPassword = function(email) {
  return this.findOne({ email, isActive: true }).select("+password");
};
const User = mongoose.model("User", UserSchema);
const RideSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true
    },
    from: {
      type: String,
      required: [true, "Pickup location is required"],
      trim: true,
      maxlength: [100, "Pickup location cannot exceed 100 characters"]
    },
    to: {
      type: String,
      required: [true, "Destination is required"],
      trim: true,
      maxlength: [100, "Destination cannot exceed 100 characters"]
    },
    date: {
      type: Date,
      required: [true, "Ride date is required"],
      index: true
    },
    amount: {
      type: Number,
      required: [true, "Ride amount is required"],
      min: [0, "Amount cannot be negative"],
      validate: {
        validator: function(value) {
          return Number.isFinite(value) && value >= 0;
        },
        message: "Amount must be a valid positive number"
      }
    },
    status: {
      type: String,
      enum: {
        values: ["Completed", "Cancelled", "In Progress"],
        message: "Status must be Completed, Cancelled, or In Progress"
      },
      default: "In Progress",
      index: true
    },
    driverName: {
      type: String,
      required: [true, "Driver name is required"],
      trim: true,
      maxlength: [50, "Driver name cannot exceed 50 characters"]
    },
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
      validate: {
        validator: function(value) {
          return Number.isInteger(value) && value >= 1 && value <= 5;
        },
        message: "Rating must be an integer between 1 and 5"
      }
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      enum: {
        values: ["Card", "Cash", "Digital Wallet"],
        message: "Payment method must be Card, Cash, or Digital Wallet"
      }
    },
    duration: {
      type: Number,
      min: [1, "Duration must be at least 1 minute"],
      validate: {
        validator: function(value) {
          return !value || Number.isInteger(value) && value > 0;
        },
        message: "Duration must be a positive integer (minutes)"
      }
    },
    distance: {
      type: Number,
      min: [0.1, "Distance must be at least 0.1 km"],
      validate: {
        validator: function(value) {
          return !value || Number.isFinite(value) && value > 0;
        },
        message: "Distance must be a positive number (kilometers)"
      }
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);
RideSchema.index({ userId: 1, date: -1 });
RideSchema.index({ status: 1, date: -1 });
RideSchema.index({ date: -1 });
RideSchema.index({ userId: 1, status: 1 });
RideSchema.statics.findByUserId = function(userId, limit = 10) {
  return this.find({ userId }).sort({ date: -1 }).limit(limit).populate("userId", "name email");
};
RideSchema.statics.findRecentByUserId = function(userId, limit = 5) {
  return this.find({ userId, status: "Completed" }).sort({ date: -1 }).limit(limit);
};
RideSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalRides: { $sum: 1 },
        totalSpent: { $sum: "$amount" },
        averageRating: { $avg: "$rating" },
        completedRides: {
          $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
        }
      }
    }
  ]);
  return stats[0] || {
    totalRides: 0,
    totalSpent: 0,
    averageRating: 0,
    completedRides: 0
  };
};
const Ride = mongoose.model("Ride", RideSchema);
const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email, isActive: true });
    return user;
  } catch (error) {
    console.error("Error finding user by email:", error);
    return null;
  }
};
const getUserById = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const user = await User.findById(id);
    return user;
  } catch (error) {
    console.error("Error finding user by ID:", error);
    return null;
  }
};
const createUser = async (userData) => {
  try {
    const newUser = new User({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      dateOfBirth: userData.dateOfBirth,
      address: userData.address,
      joinDate: /* @__PURE__ */ new Date(),
      memberLevel: "Bronze",
      isActive: true
    });
    const savedUser = await newUser.save();
    return savedUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};
const getUserRides = async (userId, limit = 10) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return [];
    }
    const rides = await Ride.find({ userId }).sort({ date: -1 }).limit(limit);
    return rides;
  } catch (error) {
    console.error("Error fetching user rides:", error);
    return [];
  }
};
const getUserStats = async (userId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return {
        totalRides: 0,
        totalSpent: 0,
        averageRating: 0,
        memberLevel: "Bronze",
        joinDate: /* @__PURE__ */ new Date()
      };
    }
    const user = await User.findById(userId);
    if (!user) {
      return {
        totalRides: 0,
        totalSpent: 0,
        averageRating: 0,
        memberLevel: "Bronze",
        joinDate: /* @__PURE__ */ new Date()
      };
    }
    const rideStats = await Ride.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalRides: { $sum: 1 },
          totalSpent: { $sum: "$amount" },
          ratingsSum: { $sum: "$rating" },
          ratingsCount: {
            $sum: { $cond: [{ $ne: ["$rating", null] }, 1, 0] }
          }
        }
      }
    ]);
    const stats = rideStats[0] || {
      totalRides: 0,
      totalSpent: 0,
      ratingsSum: 0,
      ratingsCount: 0
    };
    const averageRating = stats.ratingsCount > 0 ? stats.ratingsSum / stats.ratingsCount : 0;
    return {
      totalRides: stats.totalRides,
      totalSpent: stats.totalSpent,
      averageRating: Math.round(averageRating * 10) / 10,
      // Round to 1 decimal
      memberLevel: user.memberLevel,
      joinDate: user.joinDate
    };
  } catch (error) {
    console.error("Error calculating user stats:", error);
    return {
      totalRides: 0,
      totalSpent: 0,
      averageRating: 0,
      memberLevel: "Bronze",
      joinDate: /* @__PURE__ */ new Date()
    };
  }
};
const validateUserCredentials = async (email, password) => {
  try {
    const user = await User.findOne({ email, isActive: true }).select(
      "+password"
    );
    if (!user) {
      return null;
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return null;
    }
    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
  } catch (error) {
    console.error("Error validating user credentials:", error);
    return null;
  }
};
const addSampleRidesForUser = async (userId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return;
    }
    const sampleRides = [
      {
        userId: new mongoose.Types.ObjectId(userId),
        from: "Welcome Location",
        to: "First Destination",
        date: new Date(Date.now() - 2 * 60 * 60 * 1e3),
        // 2 hours ago
        amount: 15.75,
        status: "Completed",
        driverName: "Welcome Driver",
        rating: 5,
        paymentMethod: "Card",
        duration: 20,
        distance: 6.2
      }
    ];
    await Ride.insertMany(sampleRides);
    console.log(
      `✅ Added ${sampleRides.length} sample rides for user ${userId}`
    );
  } catch (error) {
    console.error("Error adding sample rides:", error);
  }
};
const initializeDatabase = async () => {
  try {
    console.log("🔧 Initializing MongoDB database...");
    const existingUsersCount = await User.countDocuments();
    if (existingUsersCount > 0) {
      console.log(
        `📊 Database already has ${existingUsersCount} users. Skipping initialization.`
      );
      return;
    }
    console.log("🏗️ Creating sample users and rides...");
    const sampleUsers = [
      {
        name: "John Smith",
        email: "john@example.com",
        phone: "+1234567890",
        password: "password123",
        memberLevel: "Gold"
      },
      {
        name: "Sarah Johnson",
        email: "sarah@example.com",
        phone: "+1987654321",
        password: "password456",
        memberLevel: "Silver"
      }
    ];
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`✅ Created ${createdUsers.length} sample users`);
    const johnUser = createdUsers.find(
      (user) => user.email === "john@example.com"
    );
    if (johnUser) {
      const sampleRides = [
        {
          userId: johnUser._id,
          from: "Downtown Office",
          to: "Home",
          date: /* @__PURE__ */ new Date(),
          amount: 24.5,
          status: "Completed",
          driverName: "Mike Wilson",
          rating: 5,
          paymentMethod: "Card",
          duration: 25,
          distance: 8.5
        },
        {
          userId: johnUser._id,
          from: "Airport Terminal 1",
          to: "City Center",
          date: new Date(Date.now() - 24 * 60 * 60 * 1e3),
          // Yesterday
          amount: 45.8,
          status: "Completed",
          driverName: "David Chen",
          rating: 4,
          paymentMethod: "Card",
          duration: 35,
          distance: 22.3
        },
        {
          userId: johnUser._id,
          from: "Shopping Mall",
          to: "Restaurant District",
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1e3),
          // 3 days ago
          amount: 18.3,
          status: "Completed",
          driverName: "Alex Rodriguez",
          rating: 5,
          paymentMethod: "Cash",
          duration: 18,
          distance: 5.2
        },
        {
          userId: johnUser._id,
          from: "Hotel Plaza",
          to: "Conference Center",
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3),
          // 1 week ago
          amount: 32.4,
          status: "Completed",
          driverName: "Jennifer Adams",
          rating: 4,
          paymentMethod: "Card",
          duration: 28,
          distance: 12.1
        }
      ];
      await Ride.insertMany(sampleRides);
      console.log(
        `✅ Created ${sampleRides.length} sample rides for John Smith`
      );
    }
    const sarahUser = createdUsers.find(
      (user) => user.email === "sarah@example.com"
    );
    if (sarahUser) {
      const sarahRides = [
        {
          userId: sarahUser._id,
          from: "University Campus",
          to: "Coffee Shop",
          date: /* @__PURE__ */ new Date(),
          amount: 12.4,
          status: "Completed",
          driverName: "Emma Davis",
          rating: 5,
          paymentMethod: "Card",
          duration: 15,
          distance: 3.1
        }
      ];
      await Ride.insertMany(sarahRides);
      console.log(
        `✅ Created ${sarahRides.length} sample rides for Sarah Johnson`
      );
    }
    console.log("🎉 Database initialization completed successfully!");
    const totalUsers = await User.countDocuments();
    const totalRides = await Ride.countDocuments();
    console.log(`📊 Total users: ${totalUsers}`);
    console.log(`🚗 Total rides: ${totalRides}`);
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    throw error;
  }
};
const getAllUsers = async () => {
  try {
    const users = await User.find({ isActive: true }).sort({ joinDate: -1 });
    return users;
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
};
const getAllRides = async () => {
  try {
    const rides = await Ride.find().populate("userId", "name email").sort({ date: -1 });
    return rides;
  } catch (error) {
    console.error("Error fetching all rides:", error);
    return [];
  }
};
const mongoDatabase = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  addSampleRidesForUser,
  createUser,
  getAllRides,
  getAllUsers,
  getUserByEmail,
  getUserById,
  getUserRides,
  getUserStats,
  initializeDatabase,
  validateUserCredentials
}, Symbol.toStringTag, { value: "Module" }));
const loginHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({
        success: false,
        error: "Email and password are required"
      });
    }
    const user = await validateUserCredentials(email, password);
    if (!user) {
      return res.json({
        success: false,
        error: "Invalid email or password"
      });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Login error:", error);
    res.json({
      success: false,
      error: "An error occurred during login"
    });
  }
};
const signupHandler = async (req, res) => {
  try {
    const { name, email, phone, password, dateOfBirth, address } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        error: "Name, email, phone, and password are required"
      });
    }
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "User with this email already exists"
      });
    }
    const newUser = await createUser({
      name,
      email,
      phone,
      password,
      // In real app, hash the password
      dateOfBirth,
      address
    });
    await addSampleRidesForUser(newUser.id);
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred during signup"
    });
  }
};
const getUserDataHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.json({
        success: false,
        error: "User ID is required"
      });
    }
    const user = await getUserById(userId);
    if (!user) {
      return res.json({
        success: false,
        error: "User not found"
      });
    }
    const recentRides = await getUserRides(userId, 5);
    const stats = await getUserStats(userId);
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      user: userWithoutPassword,
      recentRides,
      stats
    });
  } catch (error) {
    console.error("Get user data error:", error);
    res.json({
      success: false,
      error: "An error occurred while fetching user data"
    });
  }
};
const getUserRidesHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    if (!userId) {
      return res.json({
        success: false,
        error: "User ID is required"
      });
    }
    const rides = await getUserRides(userId, limit);
    res.json({
      success: true,
      rides
    });
  } catch (error) {
    console.error("Get user rides error:", error);
    res.json({
      success: false,
      error: "An error occurred while fetching rides"
    });
  }
};
const router$1 = Router();
router$1.get("/", async (_req, res) => {
  try {
    const rides = await getAllRides();
    res.status(200).json({
      success: true,
      message: "Rides retrieved successfully",
      data: rides
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching rides",
      error: error.message
    });
  }
});
const router = express__default.Router();
router.get("/", async (_req, res) => {
  try {
    const users = await getAllUsers();
    res.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, error: "Failed to fetch users" });
  }
});
router.post("/", async (req, res) => {
  try {
    const user = await createUser(req.body);
    res.status(201).json({ success: true, user });
  } catch (error) {
    if (error.name === "ValidationError") {
      console.error("Validation error creating user:", error);
      res.status(400).json({ success: false, error: error.message });
    } else {
      console.error("Error creating user:", error);
      res.status(500).json({ success: false, error: "Failed to create user", details: error.message });
    }
  }
});
router.get("/:userId", async (req, res) => {
  try {
    const user = await getUserById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ success: false, error: "Failed to fetch user" });
  }
});
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/quickride";
const connectionOptions = {
  serverSelectionTimeoutMS: 5e3,
  // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45e3,
  // Close sockets after 45 seconds of inactivity
  maxPoolSize: 10,
  // Maintain up to 10 socket connections
  minPoolSize: 5,
  // Maintain a minimum of 5 socket connections
  maxIdleTimeMS: 3e4
  // Close connections after 30 seconds of inactivity
  // bufferCommands: false, // Disable mongoose buffering
  // bufferMaxEntries: 0, // Disable mongoose buffering
  // Removed deprecated options causing MongoParseError
};
let isConnected = false;
const connectToDatabase = async () => {
  if (isConnected) {
    console.log("📊 Already connected to MongoDB");
    return;
  }
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI, connectionOptions);
    isConnected = true;
    console.log("✅ Successfully connected to MongoDB");
    console.log(`📍 Database: ${mongoose.connection.name}`);
    mongoose.connection.on("error", (error) => {
      console.error("❌ MongoDB connection error:", error);
      isConnected = false;
    });
    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected");
      isConnected = false;
    });
    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB reconnected");
      isConnected = true;
    });
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    isConnected = false;
    throw error;
  }
};
const disconnectFromDatabase = async () => {
  if (!isConnected) {
    return;
  }
  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log("🔌 Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error disconnecting from MongoDB:", error);
    throw error;
  }
};
process.on("SIGINT", async () => {
  console.log("\n⚠️ Process interrupted, closing MongoDB connection...");
  await disconnectFromDatabase();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  console.log("\n⚠️ Process terminated, closing MongoDB connection...");
  await disconnectFromDatabase();
  process.exit(0);
});
async function createServer() {
  const app = express__default();
  try {
    await connectToDatabase();
    await initializeDatabase();
  } catch (error) {
    console.error("❌ Failed to initialize database:", error);
  }
  app.use(cors());
  app.use(express__default.json());
  app.use(express__default.urlencoded({ extended: true }));
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });
  app.get("/api/demo", handleDemo);
  app.post("/api/auth/login", loginHandler);
  app.post("/api/auth/signup", signupHandler);
  app.get("/api/user/:userId/data", getUserDataHandler);
  app.get("/api/user/:userId/rides", getUserRidesHandler);
  app.use("/api/users", router);
  app.use("/api/rides", router$1);
  app.get("/api/admin/users", async (_req, res) => {
    try {
      const { getAllUsers: getAllUsers2 } = await Promise.resolve().then(() => mongoDatabase);
      const users = await getAllUsers2();
      res.json({ success: true, users });
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ success: false, error: "Failed to fetch users" });
    }
  });
  app.get("/api/admin/rides", async (_req, res) => {
    try {
      const { getAllRides: getAllRides2 } = await Promise.resolve().then(() => mongoDatabase);
      const rides = await getAllRides2();
      res.json({ success: true, rides });
    } catch (error) {
      console.error("Error fetching all rides:", error);
      res.status(500).json({ success: false, error: "Failed to fetch rides" });
    }
  });
  return app;
}
async function startServer() {
  try {
    const app = await createServer();
    const port = process.env.PORT || 3e3;
    const __dirname = import.meta.dirname;
    const distPath = path.join(__dirname, "../spa");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
        return res.status(404).json({ error: "API endpoint not found" });
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
    app.listen(port, () => {
      console.log(`🚀 QuickRide server running on port ${port}`);
      console.log(`📱 Frontend: http://localhost:${port}`);
      console.log(`🔧 API: http://localhost:${port}/api`);
      console.log(`🗃️ Database: MongoDB`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}
startServer();
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});
process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
//# sourceMappingURL=node-build.mjs.map
