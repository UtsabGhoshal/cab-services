import mongoose from "mongoose";

// MongoDB configuration
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/quickride";

// Connection options for better performance and reliability
const connectionOptions = {
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  maxPoolSize: 10, // Maintain up to 10 socket connections
  minPoolSize: 5, // Maintain a minimum of 5 socket connections
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  // bufferCommands: false, // Disable mongoose buffering
  // bufferMaxEntries: 0, // Disable mongoose buffering
  // Removed deprecated options causing MongoParseError
};

let isConnected = false;

export const connectToDatabase = async (): Promise<void> => {
  if (isConnected) {
    console.log("📊 Already connected to MongoDB");
    return;
  }

  try {
    console.log("🔗 Connecting to MongoDB...");

    await mongoose.connect(MONGODB_URI, connectionOptions);

    isConnected = true;
    console.log("✅ Successfully connected to MongoDB");
    console.log(`📍 Database: ${mongoose.connection.name}`);

    // Handle connection events
    mongoose.connection.on("error", (error) => {
      console.error("❌ MongoDB connection error:", error);
      isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected");
      isConnected = false;
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB reconnected");
      isConnected = true;
    });
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    isConnected = false;
    throw error;
  }
};

export const disconnectFromDatabase = async (): Promise<void> => {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log("🔌 Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error disconnecting from MongoDB:", error);
    throw error;
  }
};

export const getConnectionStatus = (): boolean => {
  return isConnected && mongoose.connection.readyState === 1;
};

// Handle process termination
process.on("SIGINT", async () => {
  console.log("\n⚠️ Process interrupted, closing MongoDB connection...");
  await disconnectFromDatabase();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n⚠️ Process terminated, closing MongoDB connection...");
  await disconnectFromDatabase();
  process.exit(0);
});
