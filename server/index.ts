import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  loginHandler,
  signupHandler,
} from "./routes/auth";
import {
  driverLoginHandler,
  driverSignupHandler,
  getDriverProfileHandler,
  updateDriverStatusHandler,
  getDriversHandler,
} from "./routes/driverAuth";
import { getUserDataHandler, getUserRidesHandler } from "./routes/user";
import ridesRouter from "./routes/rides";
import usersRouter from "./routes/users";
import { getMapsConfigHandler } from "./routes/maps";
import { addSampleRidesHandler } from "./routes/test";

export async function createServer() {
  const app = express();

  console.log("🚀 Server starting with Supabase backend...");

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

  // Driver authentication routes
  app.post("/api/driver/login", driverLoginHandler);
  app.post("/api/driver/signup", driverSignupHandler);
  app.get("/api/driver/:driverId/profile", getDriverProfileHandler);
  app.put("/api/driver/:driverId/status", updateDriverStatusHandler);
  app.get("/api/drivers", getDriversHandler);

  // Admin/Security routes (deprecated)
  app.post("/api/auth/migrate-passwords", (req, res) => {
    res.status(501).json({ success: false, error: "Migration moved to Supabase" });
  });

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
      res.status(501).json({
        success: false,
        error: "Test rides moved to Supabase. Please use client-side operations.",
      });
    } catch (error) {
      console.error("Test rides error:", error);
      res.json({ success: false, error: "Failed to create test rides" });
    }
  });

  // Test endpoint to reset user password
  app.post("/api/test/reset-password", async (req, res) => {
    try {
      res.status(501).json({
        success: false,
        error: "Password reset moved to Supabase. Please use client-side auth.",
      });
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
