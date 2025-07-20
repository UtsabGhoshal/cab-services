import { RequestHandler } from "express";
import { UserDataResponse } from "@shared/database";
import {
  getUserById,
  getUserRides,
  getUserStats,
} from "../database/mongoDatabase";

export const getUserDataHandler: RequestHandler<
  { userId: string },
  UserDataResponse
> = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.json({
        success: false,
        error: "User ID is required",
      });
    }

    // Get user data
    const user = await getUserById(userId);
    if (!user) {
      return res.json({
        success: false,
        error: "User not found",
      });
    }

    // Get recent rides
    const recentRides = await getUserRides(userId, 5);

    // Get user stats
    const stats = await getUserStats(userId);

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword as any,
      recentRides,
      stats,
    });
  } catch (error) {
    console.error("Get user data error:", error);
    res.json({
      success: false,
      error: "An error occurred while fetching user data",
    });
  }
};

export const getUserRidesHandler: RequestHandler<
  { userId: string },
  { success: boolean; rides?: any[]; error?: string }
> = async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!userId) {
      return res.json({
        success: false,
        error: "User ID is required",
      });
    }

    const rides = await getUserRides(userId, limit);

    res.json({
      success: true,
      rides,
    });
  } catch (error) {
    console.error("Get user rides error:", error);
    res.json({
      success: false,
      error: "An error occurred while fetching rides",
    });
  }
};
