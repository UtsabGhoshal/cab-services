import { RequestHandler } from "express";

export const getUserDataHandler: RequestHandler = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      error: "User data moved to Supabase. Please use client-side queries.",
    });
  } catch (error) {
    console.error("User data error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const getUserRidesHandler: RequestHandler = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      error: "User rides moved to Supabase. Please use client-side queries.",
    });
  } catch (error) {
    console.error("User rides error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
