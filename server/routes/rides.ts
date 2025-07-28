import { Router, Request, Response } from "express";
import { getAllRides, createRide } from "../database/databaseService";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const rides = await getAllRides();
    res.status(200).json({
      success: true,
      message: "Rides retrieved successfully",
      data: rides,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching rides",
      error: error.message,
    });
  }
});

// Create a new ride
router.post("/", async (req: Request, res: Response) => {
  try {
    const { userId, pickup, destination, carType, purpose, pricing } = req.body;

    // Validate required fields
    if (
      !userId ||
      !pickup ||
      !destination ||
      !carType ||
      !purpose ||
      !pricing
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: userId, pickup, destination, carType, purpose, pricing",
      });
    }

    // Create ride data
    const rideData = {
      userId,
      from: pickup.address,
      to: destination.address,
      amount: pricing.finalPrice,
      carType,
      purpose,
      distance: pricing.distance,
      estimatedTime: pricing.estimatedTime,
    };

    const newRide = await createRide(rideData);

    if (!newRide) {
      return res.status(500).json({
        success: false,
        message: "Failed to create ride",
      });
    }

    res.status(201).json({
      success: true,
      message: "Ride created successfully",
      data: newRide,
    });
  } catch (error: any) {
    console.error("Error creating ride:", error);
    res.status(500).json({
      success: false,
      message: "Error creating ride",
      error: error.message,
    });
  }
});

export default router;
