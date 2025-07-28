// Database service that uses Firebase Firestore with fallback to mock database
// This provides a consistent interface for all database operations

// Using mock database for now until Firebase Firestore is enabled
let databaseType: 'firebase' | 'mock' = 'mock';

export const getDatabaseService = async () => {
  if (databaseType === 'firebase') {
    try {
      const firebaseDb = await import("../firebase/firebaseDatabase");
      // Test Firebase connection by attempting a simple operation
      await firebaseDb.getAllUsers();
      return firebaseDb;
    } catch (error) {
      console.warn("⚠️ Firebase not accessible, falling back to mock database");
      console.log("🔧 To use Firebase, ensure Firestore is enabled in your Firebase console");
      databaseType = 'mock';
      return await import("./mockDatabase");
    }
  } else {
    // Use mock database
    return await import("./mockDatabase");
  }
};

// Re-export common database functions with automatic fallback
export const getUserById = async (id: string) => {
  const db = await getDatabaseService();
  return db.getUserById(id);
};

export const getUserByEmail = async (email: string) => {
  const db = await getDatabaseService();
  return db.getUserByEmail(email);
};

export const createUser = async (userData: any) => {
  const db = await getDatabaseService();
  return db.createUser(userData);
};

export const getUserRides = async (userId: string, limit?: number) => {
  const db = await getDatabaseService();
  return db.getUserRides(userId, limit);
};

export const getUserStats = async (userId: string) => {
  const db = await getDatabaseService();
  return db.getUserStats(userId);
};

export const validateUserCredentials = async (email: string, password: string) => {
  const db = await getDatabaseService();
  return db.validateUserCredentials(email, password);
};

export const getAllUsers = async () => {
  const db = await getDatabaseService();
  return db.getAllUsers();
};

export const getAllRides = async () => {
  const db = await getDatabaseService();
  return db.getAllRides();
};

export const addSampleRidesForUser = async (userId: string) => {
  const db = await getDatabaseService();
  if (db.addSampleRidesForUser) {
    return db.addSampleRidesForUser(userId);
  }
  // MongoDB version doesn't have this function
};
