import { RequestHandler } from "express";

export const addSampleRidesHandler: RequestHandler = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      error:
        "Test routes moved to Supabase. Please use client-side operations.",
    });
  } catch (error) {
    console.error("Test route error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
