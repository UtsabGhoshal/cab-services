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

  // Initialize database (Mock database for now until Firebase Firestore is enabled)
  console.log("🔧 Using mock database for development");
  console.log("💡 To use Firebase, enable Firestore in your Firebase console:");
  console.log("   https://console.firebase.google.com/project/uride-cab-service/firestore");
  console.log("   Then restart the server to automatically switch to Firebase");

  // Initialize mock database
  const { initializeDatabase: initMockDb } = await import("./database/mockDatabase");
  initMockDb();

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
