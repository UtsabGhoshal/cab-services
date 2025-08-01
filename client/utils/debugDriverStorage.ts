import { localDatabaseService } from "@/services/localDatabase";
import { fallbackAuthService } from "@/services/fallbackAuthService";
import { firebaseDriverService } from "@/services/firebaseDriverService";

export const testDriverStorage = async (): Promise<void> => {
  console.log("🧪 Testing driver data storage...");
  
  try {
    // Test local database
    console.log("📦 Testing local database...");
    const localDrivers = await localDatabaseService.getAllDrivers();
    console.log(`✅ Local database has ${localDrivers.length} drivers`);
    
    if (localDrivers.length > 0) {
      console.log("📋 Local drivers:", localDrivers.map(d => ({ email: d.email, name: d.name, status: d.status })));
    }
    
    // Test fallback service
    console.log("🔄 Testing fallback service...");
    const testEmails = ["rajesh.driver@uride.com", "amit.fleet@uride.com"];
    
    for (const email of testEmails) {
      const driver = await fallbackAuthService.getDriverByEmail(email);
      if (driver) {
        console.log(`✅ Fallback service found driver: ${email} (${driver.name})`);
      } else {
        console.log(`❌ Fallback service could not find driver: ${email}`);
      }
    }
    
    // Test Firebase connectivity
    console.log("🔥 Testing Firebase connectivity...");
    try {
      await firebaseDriverService.getAllDrivers();
      console.log("✅ Firebase is connected and working");
    } catch (error) {
      console.log("❌ Firebase is not available:", error);
    }
    
    console.log("✅ Driver storage test completed");
    
  } catch (error) {
    console.error("❌ Driver storage test failed:", error);
  }
};

export const clearAllDriverData = (): void => {
  try {
    localDatabaseService.clearAllData();
    console.log("🧹 All driver data cleared");
  } catch (error) {
    console.error("Error clearing driver data:", error);
  }
};

export const logDriverDataSummary = async (): Promise<void> => {
  try {
    const localDrivers = await localDatabaseService.getAllDrivers();
    
    console.log("📊 Driver Data Summary");
    console.log("=====================");
    console.log(`Local Drivers: ${localDrivers.length}`);
    
    if (localDrivers.length > 0) {
      console.log("\nDrivers in local database:");
      localDrivers.forEach((driver, index) => {
        console.log(`${index + 1}. ${driver.name} (${driver.email}) - ${driver.status}`);
        console.log(`   Type: ${driver.driverType.type} | Rides: ${driver.totalRides} | Rating: ${driver.averageRating}★`);
      });
    }
    
    console.log("=====================");
  } catch (error) {
    console.error("Error logging driver data summary:", error);
  }
};

// Make functions available globally in development
if (import.meta.env.DEV) {
  (window as any).debugDriverStorage = {
    test: testDriverStorage,
    clear: clearAllDriverData,
    summary: logDriverDataSummary,
  };
  
  console.log("🛠️  Debug functions available:");
  console.log("   window.debugDriverStorage.test() - Test driver storage");
  console.log("   window.debugDriverStorage.clear() - Clear all driver data");
  console.log("   window.debugDriverStorage.summary() - Show driver data summary");
}
