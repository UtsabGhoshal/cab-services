import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  loginHandler,
  signupHandler,
  migratePasswordsHandler,
} from "./routes/auth";
import { getUserDataHandler, getUserRidesHandler } from "./routes/user";
import ridesRouter from "./routes/rides";
import usersRouter from "./routes/users";
import { getMapsConfigHandler } from "./routes/maps";
import { addSampleRidesHandler } from "./routes/test";
import { initializeDatabase } from "./firebase/firebaseDatabase";

export async function createServer() {
  const app = express();

  // Initialize database (Firebase with fallback to mock)
  try {
    console.log("🔥 Initializing Firebase database...");
    await initializeDatabase();
    console.log("✅ Firebase database initialized successfully");
  } catch (error) {
    console.warn(
      "⚠️ Firebase not available, using mock database for development",
    );
    console.log("🔧 Error:", error.message);
    // Initialize mock database
    const { initializeDatabase: initMockDb } = await import(
      "./database/mockDatabase"
    );
    initMockDb();
  }

  // Middleware
  app.use(cors());

  // Add request logging
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes
  app.post("/api/auth/login", loginHandler);
  app.post("/api/auth/signup", signupHandler);

  // Admin/Security routes
  app.post("/api/auth/migrate-passwords", migratePasswordsHandler);

  // Maps configuration route (secure API key delivery)
  app.get("/api/maps/config", getMapsConfigHandler);

  // User data routes
  app.get("/api/user/:userId/data", getUserDataHandler);
  app.get("/api/user/:userId/rides", getUserRidesHandler);

  // Users routes
  app.use("/api/users", usersRouter);

  // Rides routes
  app.use("/api/rides", ridesRouter);

  // Test routes (for development)
  app.post("/api/test/user/:userId/sample-rides", addSampleRidesHandler);

  // Quick test endpoint to add rides for logged-in user
  app.post("/api/test/add-rides", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.json({ success: false, error: "User ID required" });
      }

      const { createRide } = await import("./database/databaseService");

      // Create test rides
      const testRides = [
        {
          userId,
          from: "Connaught Place",
          to: "IGI Airport Terminal 3",
          amount: 520.0,
          carType: "Premium",
          purpose: "Airport Transfer",
          distance: "22.3",
          estimatedTime: "35",
        },
        {
          userId,
          from: "India Gate",
          to: "Karol Bagh Metro",
          amount: 180.0,
          carType: "Standard",
          purpose: "Business",
          distance: "8.5",
          estimatedTime: "20",
        },
      ];

      const createdRides = [];
      for (const rideData of testRides) {
        const ride = await createRide(rideData);
        if (ride) createdRides.push(ride);
      }

      res.json({
        success: true,
        message: `Created ${createdRides.length} test rides`,
        rides: createdRides,
      });
    } catch (error) {
      console.error("Test rides error:", error);
      res.json({ success: false, error: "Failed to create test rides" });
    }
  });

  // Test endpoint to reset user password
  app.post("/api/test/reset-password", async (req, res) => {
    try {
      const { email, newPassword } = req.body;
      if (!email || !newPassword) {
        return res.json({
          success: false,
          error: "Email and new password required",
        });
      }

      const { getUserByEmail, db } = await import(
        "./firebase/firebaseDatabase"
      );
      const { doc, updateDoc, collection } = await import("firebase/firestore");
      const bcrypt = await import("bcryptjs");

      const user = await getUserByEmail(email);
      if (!user) {
        return res.json({ success: false, error: "User not found" });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update user password in Firebase
      const userRef = doc(collection(db, "users"), user.id);
      await updateDoc(userRef, { password: hashedPassword });

      res.json({ success: true, message: `Password updated for ${email}` });
    } catch (error) {
      console.error("Password reset error:", error);
      res.json({ success: false, error: "Failed to reset password" });
    }
  });

  // Admin/Debug routes (for development)
  app.get("/api/admin/users", async (_req, res) => {
    try {
      const { getAllUsers } = await import("./database/databaseService");
      const users = await getAllUsers();
      res.json({ success: true, users });
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ success: false, error: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/rides", async (_req, res) => {
    try {
      const { getAllRides } = await import("./database/databaseService");
      const rides = await getAllRides();
      res.json({ success: true, rides });
    } catch (error) {
      console.error("Error fetching all rides:", error);
      res.status(500).json({ success: false, error: "Failed to fetch rides" });
    }
  });

  return app;
}
