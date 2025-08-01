import { createDemoDriversIfNeeded } from "./demoDriverSetup";
import { checkFirebaseConnection } from "./firebaseCheck";
import { printFirebaseDiagnostics } from "./firebaseDiagnostics";

export const initializeApp = async (): Promise<void> => {
  try {
    console.log("🚀 Initializing URide application...");

    // Check Firebase connectivity
    const firebaseAvailable = await checkFirebaseConnection();

    if (!firebaseAvailable) {
      console.log("🔍 Firebase unavailable - running diagnostics...");
      await printFirebaseDiagnostics();
    }

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
