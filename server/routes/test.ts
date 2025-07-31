import { RequestHandler } from "express";
import { addSampleRidesForUser, createRide } from "../database/databaseService";

export const addSampleRidesHandler: RequestHandler<
  { userId: string },
  { success: boolean; message: string; rides?: any }
> = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`🧪 Adding sample rides for userId: ${userId}`);

    if (!userId) {
      return res.json({
        success: false,
        message: "User ID is required",
      });
    }

    // Create multiple sample rides with different dates
    const sampleRidesData = [
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
      {
        userId,
        from: "Dwarka Sector 12",
        to: "Cyber City Gurgaon",
        amount: 340.0,
        carType: "Premium",
        purpose: "Work",
        distance: "15.2",
        estimatedTime: "28",
      },
    ];

    const createdRides = [];
    for (const rideData of sampleRidesData) {
      const ride = await createRide(rideData);
      if (ride) {
        createdRides.push(ride);
      }
    }

    console.log(
      `✅ Created ${createdRides.length} sample rides for user ${userId}`,
    );

    res.json({
      success: true,
      message: `Created ${createdRides.length} sample rides successfully`,
      rides: createdRides,
    });
  } catch (error) {
    console.error("Error adding sample rides:", error);
    res.json({
      success: false,
      message: "An error occurred while adding sample rides",
    });
  }
};
