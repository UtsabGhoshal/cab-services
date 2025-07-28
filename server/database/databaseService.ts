// Database service that uses Firebase Firestore
// This provides a consistent interface for all database operations

export const getDatabaseService = async () => {
  // Always use Firebase database
  return await import("../firebase/firebaseDatabase");
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
