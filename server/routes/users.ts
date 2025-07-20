import express from "express";
import { getUserDataHandler, getUserRidesHandler } from "./user";
import { getAllUsers, createUser, getUserById } from "../database/mongoDatabase";

const router = express.Router();

// Get all users
router.get("/", async (_req, res) => {
  try {
    const users = await getAllUsers();
    res.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, error: "Failed to fetch users" });
  }
});

// Create a new user
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

// Get user by ID
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

export default router;
