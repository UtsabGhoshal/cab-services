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
} from "../database/databaseService";
import { migratePasswordsToHashed } from "../firebase/firebaseDatabase";

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
    // Ensure response hasn't been sent yet
    if (res.headersSent) {
      console.warn("Headers already sent in signup handler");
      return;
    }

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

    // Create new user - only include defined fields
    const userCreateData: any = {
      name,
      email,
      phone,
      password, // In real app, hash the password
    };

    // Only add optional fields if they're provided
    if (dateOfBirth !== undefined) {
      userCreateData.dateOfBirth = dateOfBirth;
    }
    if (address !== undefined) {
      userCreateData.address = address;
    }

    const newUser = await createUser(userCreateData);

    // Add some sample rides for new user (only for mock database)
    try {
      const { addSampleRidesForUser } = await import(
        "../database/databaseService"
      );
      if (addSampleRidesForUser) {
        await addSampleRidesForUser(newUser.id);
      }
    } catch (error) {
      // Ignore if function doesn't exist (MongoDB case)
      console.log("Sample rides not added:", error.message);
    }

    // Remove password from response
    const { password: _, ...userObj } = newUser;

    // Ensure we only send response once
    if (!res.headersSent) {
      res.status(201).json({
        success: true,
        user: userObj,
      });
    }
  } catch (error) {
    console.error("Signup error:", error);

    // Ensure we only send response once
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: "An error occurred during signup",
      });
    }
  }
};

export const migratePasswordsHandler: RequestHandler = async (req, res) => {
  try {
    await migratePasswordsToHashed();

    res.json({
      success: true,
      message: "Passwords migrated to hashed format successfully",
    });
  } catch (error) {
    console.error("Migration error:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred during password migration",
    });
  }
};
