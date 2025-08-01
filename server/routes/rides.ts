import { RequestHandler, Router } from "express";

const router = Router();

const getAllRidesHandler: RequestHandler = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      error: "Rides data moved to Supabase. Please use client-side queries.",
    });
  } catch (error) {
    console.error("Rides error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

const createRideHandler: RequestHandler = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      error: "Ride creation moved to Supabase. Please use client-side operations.",
    });
  } catch (error) {
    console.error("Create ride error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

router.get("/", getAllRidesHandler);
router.post("/", createRideHandler);

export default router;
