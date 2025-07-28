import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { loginHandler, signupHandler } from "./routes/auth";
import { getUserDataHandler, getUserRidesHandler } from "./routes/user";
import ridesRouter from "./routes/rides";
import usersRouter from "./routes/users";
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

  // User data routes
  app.get("/api/user/:userId/data", getUserDataHandler);
  app.get("/api/user/:userId/rides", getUserRidesHandler);

  // Users routes
  app.use("/api/users", usersRouter);

  // Rides routes
  app.use("/api/rides", ridesRouter);

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
