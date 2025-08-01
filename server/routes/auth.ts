import { RequestHandler } from "express";
import {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
} from "@shared/database";

// Note: This route is deprecated - authentication now handled by Supabase
// Keep for backward compatibility or remove entirely if not needed

export const loginHandler: RequestHandler<
  {},
  LoginResponse,
  LoginRequest
> = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      error: "Authentication moved to Supabase. Please use client-side auth.",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const signupHandler: RequestHandler<
  {},
  SignupResponse,
  SignupRequest
> = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      error: "Authentication moved to Supabase. Please use client-side auth.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
