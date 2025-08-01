import { RequestHandler } from "express";

// Note: Driver authentication now handled by Supabase
// This route is deprecated but kept for backward compatibility

export const driverLoginHandler: RequestHandler = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      error:
        "Driver authentication moved to Supabase. Please use client-side auth.",
    });
  } catch (error) {
    console.error("Driver login error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const driverSignupHandler: RequestHandler = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      error:
        "Driver authentication moved to Supabase. Please use client-side auth.",
    });
  } catch (error) {
    console.error("Driver signup error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const getDriverProfileHandler: RequestHandler = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      error: "Driver data moved to Supabase. Please use client-side queries.",
    });
  } catch (error) {
    console.error("Driver profile error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const updateDriverStatusHandler: RequestHandler = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      error: "Driver status moved to Supabase. Please use client-side updates.",
    });
  } catch (error) {
    console.error("Driver status error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const getDriversHandler: RequestHandler = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      error: "Driver data moved to Supabase. Please use client-side queries.",
    });
  } catch (error) {
    console.error("Drivers list error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
