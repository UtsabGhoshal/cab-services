import { supabaseAuthService } from "@/services/supabaseAuthService";
import { supabaseDriverService } from "@/services/supabaseDriverService";
import { localDatabaseService } from "@/services/localDatabase";

export const createDemoDriversIfNeeded = async (): Promise<void> => {
  try {
    console.log("🔧 Setting up demo drivers...");

    // Initialize demo drivers in Supabase
    try {
      await supabaseDriverService.initializeDemoDrivers();
      console.log("✅ Supabase demo drivers initialized");
    } catch (supabaseError) {
      console.warn("⚠️ Supabase demo drivers setup failed:", supabaseError);
    }

    // Initialize demo drivers in local storage (fallback)
    try {
      await localDatabaseService.initializeDemoDrivers();
      console.log("✅ Local demo drivers initialized");
    } catch (localError) {
      console.warn("⚠️ Local demo drivers setup failed:", localError);
    }

    // Create Supabase Auth accounts for demo drivers
    const demoDrivers = [
      {
        email: "driver1@example.com",
        password: "password123",
      },
      {
        email: "driver2@example.com", 
        password: "password123",
      }
    ];

    for (const demo of demoDrivers) {
      try {
        // Try to create Supabase Auth user
        const { user, error } = await supabaseAuthService.signUpWithEmailAndPassword(
          demo.email,
          demo.password
        );

        if (error && !error.message.includes("already registered")) {
          console.warn(`Supabase Auth signup failed for ${demo.email}:`, error.message);
        } else if (user) {
          console.log(`✅ Supabase Auth user created/exists for: ${demo.email}`);
        }
      } catch (authError) {
        console.warn(`Auth setup error for ${demo.email}:`, authError);
      }
    }

    console.log("🎉 Demo drivers setup complete");
  } catch (error) {
    console.error("❌ Error setting up demo drivers:", error);
  }
};
