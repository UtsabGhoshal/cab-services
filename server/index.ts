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

  // Connect to MongoDB or fallback to mock database
  let usingMockDatabase = false;
  try {
    await connectToDatabase();
    // Initialize database with sample data (if needed)
    await initializeDatabase();
  } catch (error) {
    console.warn("⚠️ MongoDB not available, using mock database for development");
    console.log("🔧 To use MongoDB, ensure it's running and accessible");
    usingMockDatabase = true;
    // Initialize mock database
    const { initializeDatabase: initMockDb } = await import("./database/mockDatabase");
    initMockDb();
  }

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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
