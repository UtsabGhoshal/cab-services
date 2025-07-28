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

export default router;
