import { RequestHandler } from "express";

// Store the API key securely on the server
const GOOGLE_MAPS_API_KEY = "AIzaSyCsw5vml-R1o2c5jVvmjMyQkCi0RYwxC_c";

export interface MapsConfigResponse {
  apiKey: string;
  success: boolean;
}

export const getMapsConfigHandler: RequestHandler = (req, res) => {
  try {
    // In production, you might want to add additional security checks
    // like validating the user session or request origin

    const response: MapsConfigResponse = {
      apiKey: GOOGLE_MAPS_API_KEY,
      success: true,
    };

    res.json(response);
  } catch (error) {
    console.error("Error getting maps config:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get maps configuration",
    });
  }
};
