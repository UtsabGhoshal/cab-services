import { RequestHandler, Router } from "express";

const router = Router();

const getAllUsersHandler: RequestHandler = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      error: "Users data moved to Supabase. Please use client-side queries.",
    });
  } catch (error) {
    console.error("Users error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

const createUserHandler: RequestHandler = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      error:
        "User creation moved to Supabase. Please use client-side operations.",
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

router.get("/", getAllUsersHandler);
router.post("/", createUserHandler);

export default router;
