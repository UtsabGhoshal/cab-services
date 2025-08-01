import { createDemoDriversIfNeeded } from "./demoDriverSetup";

export const initializeApp = async (): Promise<void> => {
  try {
    console.log("🚀 Initializing URide application...");

    // Set up demo drivers for development
    if (import.meta.env.DEV) {
      console.log("🔧 Development mode: Setting up demo drivers...");
      await createDemoDriversIfNeeded();
    }

    console.log("✅ App initialization complete");
  } catch (error) {
    console.error("❌ App initialization failed:", error);
  }
};
