import { RequestHandler } from "express";
import {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
} from "@shared/database";
import {
  validateUserCredentials,
  createUser,
  getUserByEmail,
  addSampleRidesForUser,
} from "../database/mongoDatabase";

export const loginHandler: RequestHandler<
  {},
  LoginResponse,
  LoginRequest
> = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        success: false,
        error: "Email and password are required",
      });
    }

    // Validate credentials
    const user = await validateUserCredentials(email, password);

    if (!user) {
      return res.json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword as any,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.json({
      success: false,
      error: "An error occurred during login",
    });
  }
};

export const signupHandler: RequestHandler<
  {},
  SignupResponse,
  SignupRequest
> = async (req, res) => {
  try {
    const { name, email, phone, password, dateOfBirth, address } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        error: "Name, email, phone, and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "User with this email already exists",
      });
    }

    // Create new user
    const newUser = await createUser({
      name,
      email,
      phone,
      password, // In real app, hash the password
      dateOfBirth,
      address,
    });

    // Add some sample rides for new user
    await addSampleRidesForUser(newUser.id);

    // Remove password from response
    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      user: userObj,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred during signup",
    });
  }
};
