import { RequestHandler } from "express";
import { Driver } from "../database/models/Driver";

interface DriverLoginRequest {
  email: string;
  password: string;
  userType?: "driver";
}

interface DriverLoginResponse {
  success: boolean;
  driver?: any;
  token?: string;
  error?: string;
}

interface DriverSignupRequest {
  // Personal Information
  fullName: string;
  email: string;
  phone: string;
  password: string;
  dateOfBirth: string;
  address: string;

  // Driver License Information
  licenseNumber: string;
  licenseExpiry: string;

  // Vehicle Information (if owns car)
  hasVehicle: "yes" | "no";
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  vehicleColor?: string;
  vehicleNumber?: string;

  // ID Verification
  idProofType: "aadhar" | "passport" | "voter";
  idProofNumber: string;

  // Background Check
  hasCleanRecord: boolean;
  backgroundCheckConsent: boolean;

  // Terms
  acceptTerms: boolean;
  acceptPrivacyPolicy: boolean;
}

interface DriverSignupResponse {
  success: boolean;
  driverId?: string;
  message?: string;
  error?: string;
}

export const driverLoginHandler: RequestHandler<
  {},
  DriverLoginResponse,
  DriverLoginRequest
> = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        success: false,
        error: "Email and password are required",
      });
    }

    // Find driver by email with password
    const driver = await Driver.findByEmailWithPassword(email.toLowerCase());

    if (!driver) {
      return res.json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await driver.comparePassword(password);
    if (!isPasswordValid) {
      return res.json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Update last login
    driver.lastLogin = new Date();
    await driver.save();

    // Convert to plain object and remove sensitive data
    const driverData = driver.toObject();
    delete driverData.password;

    res.json({
      success: true,
      driver: driverData,
    });
  } catch (error) {
    console.error("Driver login error:", error);
    res.json({
      success: false,
      error: "An error occurred during login",
    });
  }
};

export const driverSignupHandler: RequestHandler<
  {},
  DriverSignupResponse,
  DriverSignupRequest
> = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      dateOfBirth,
      address,
      licenseNumber,
      licenseExpiry,
      hasVehicle,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleColor,
      vehicleNumber,
      idProofType,
      idProofNumber,
      hasCleanRecord,
      backgroundCheckConsent,
      acceptTerms,
      acceptPrivacyPolicy,
    } = req.body;

    // Validate required fields
    if (
      !fullName ||
      !email ||
      !phone ||
      !password ||
      !licenseNumber ||
      !idProofNumber
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    if (!acceptTerms || !acceptPrivacyPolicy) {
      return res.status(400).json({
        success: false,
        error: "You must accept the terms and privacy policy",
      });
    }

    // Check if driver already exists
    const existingDriver = await Driver.findOne({
      $or: [
        { email: email.toLowerCase() },
        { phone: phone },
        { licenseNumber: licenseNumber.toUpperCase() },
      ],
    });

    if (existingDriver) {
      return res.status(409).json({
        success: false,
        error:
          "Driver with this email, phone, or license number already exists",
      });
    }

    // Determine driver type
    const driverType = {
      type: hasVehicle === "yes" ? "owner" : ("fleet" as "owner" | "fleet"),
      commissionRate: hasVehicle === "yes" ? 0.05 : undefined,
      salaryPerKm: hasVehicle === "no" ? 12 : undefined,
    };

    // Create driver data
    const driverData = {
      name: fullName,
      email: email.toLowerCase(),
      phone,
      password, // Will be hashed by the pre-save middleware
      driverType,
      status: "pending" as const,
      address,
      dateOfBirth: new Date(dateOfBirth),
      licenseNumber: licenseNumber.toUpperCase(),
      licenseExpiry: new Date(licenseExpiry),
      idProofType,
      idProofNumber,
      hasCleanRecord,
      backgroundCheckCompleted: false,
      acceptedTerms: acceptTerms,
      acceptedPrivacyPolicy: acceptPrivacyPolicy,
      isEmailVerified: false,
      isPhoneVerified: true, // Assume phone was verified during signup

      // Vehicle information for owners
      ...(hasVehicle === "yes" && {
        vehicleNumber: vehicleNumber?.toUpperCase(),
        vehicleModel: `${vehicleMake} ${vehicleModel} ${vehicleYear}`,
      }),
    };

    // Create the driver
    const newDriver = new Driver(driverData);
    await newDriver.save();

    res.status(201).json({
      success: true,
      driverId: newDriver.id,
      message:
        "Driver application submitted successfully. You will be contacted within 24-48 hours for verification.",
    });
  } catch (error: any) {
    console.error("Driver signup error:", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        error: `Driver with this ${field} already exists`,
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (err: any) => err.message,
      );
      return res.status(400).json({
        success: false,
        error: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      error: "An error occurred during driver registration",
    });
  }
};

// Get driver profile
export const getDriverProfileHandler: RequestHandler = async (req, res) => {
  try {
    const { driverId } = req.params;

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({
        success: false,
        error: "Driver not found",
      });
    }

    res.json({
      success: true,
      driver: driver.toObject(),
    });
  } catch (error) {
    console.error("Get driver profile error:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while fetching driver profile",
    });
  }
};

// Update driver status (for admin)
export const updateDriverStatusHandler: RequestHandler = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { status } = req.body;

    if (!["active", "inactive", "pending"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status",
      });
    }

    const driver = await Driver.findByIdAndUpdate(
      driverId,
      { status },
      { new: true },
    );

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: "Driver not found",
      });
    }

    res.json({
      success: true,
      driver: driver.toObject(),
    });
  } catch (error) {
    console.error("Update driver status error:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while updating driver status",
    });
  }
};

// Get all drivers (for admin)
export const getDriversHandler: RequestHandler = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (type) filter["driverType.type"] = type;

    const drivers = await Driver.find(filter)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Driver.countDocuments(filter);

    res.json({
      success: true,
      drivers: drivers.map((driver) => driver.toObject()),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get drivers error:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while fetching drivers",
    });
  }
};
