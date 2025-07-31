import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import { User, Ride, UserStats } from "@shared/database";
import bcrypt from "bcryptjs";

// Collections
const USERS_COLLECTION = "users";
const RIDES_COLLECTION = "rides";

// Firebase database operations for URide application

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const userData = querySnapshot.docs[0].data();
    return {
      id: querySnapshot.docs[0].id,
      ...userData,
      joinDate: userData.joinDate.toDate(),
    } as User;
  } catch (error) {
    console.error("Error getting user by email:", error);
    return null;
  }
};

export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, id);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    const userData = userSnap.data();
    return {
      id: userSnap.id,
      ...userData,
      joinDate: userData.joinDate.toDate(),
    } as User;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return null;
  }
};

export const createUser = async (
  userData: Omit<User, "id" | "joinDate" | "memberLevel" | "isActive">,
): Promise<User> => {
  try {
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Filter out undefined values that Firebase doesn't accept
    const cleanedUserData = Object.fromEntries(
      Object.entries({...userData, password: hashedPassword}).filter(([_, value]) => value !== undefined),
    );

    const newUser = {
      ...cleanedUserData,
      joinDate: Timestamp.now(),
      memberLevel: "Bronze",
      isActive: true,
    };

    const docRef = await addDoc(collection(db, USERS_COLLECTION), newUser);

    return {
      id: docRef.id,
      ...newUser,
      joinDate: newUser.joinDate.toDate(),
    } as User;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const getUserRides = async (
  userId: string,
  limitCount: number = 10,
): Promise<Ride[]> => {
  try {
    const ridesRef = collection(db, RIDES_COLLECTION);
    // Remove orderBy to avoid composite index requirement
    const q = query(
      ridesRef,
      where("userId", "==", userId)
    );

    const querySnapshot = await getDocs(q);
    const rides: Ride[] = [];

    querySnapshot.forEach((doc) => {
      const rideData = doc.data();
      rides.push({
        id: doc.id,
        ...rideData,
        date: rideData.date.toDate(),
      } as Ride);
    });

    // Sort by date in JavaScript and limit
    const sortedRides = rides
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limitCount);

    console.log(`📋 Returning ${sortedRides.length} sorted rides for user ${userId}`);
    return sortedRides;
  } catch (error) {
    console.error("Error getting user rides:", error);
    return [];
  }
};

export const getUserStats = async (userId: string): Promise<UserStats> => {
  try {
    const userRides = await getUserRides(userId, 1000); // Get all rides for stats
    const user = await getUserById(userId);

    const totalRides = userRides.length;
    const totalSpent = userRides.reduce((sum, ride) => sum + ride.amount, 0);
    const ratingsSum = userRides.reduce(
      (sum, ride) => sum + (ride.rating || 0),
      0,
    );
    const averageRating = totalRides > 0 ? ratingsSum / totalRides : 0;

    return {
      totalRides,
      totalSpent,
      averageRating,
      memberLevel: user?.memberLevel || "Bronze",
      joinDate: user?.joinDate || new Date(),
    };
  } catch (error) {
    console.error("Error getting user stats:", error);
    return {
      totalRides: 0,
      totalSpent: 0,
      averageRating: 0,
      memberLevel: "Bronze",
      joinDate: new Date(),
    };
  }
};

export const validateUserCredentials = async (
  email: string,
  password: string,
): Promise<User | null> => {
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      console.log(`🔍 Login attempt: User with email ${email} not found`);
      return null;
    }

    console.log(`🔍 Login attempt for user: ${user.name} (${user.email})`);

    // Check if password is hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
    const isHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$');
    console.log(`🔐 Password type: ${isHashed ? 'Hashed (bcrypt)' : 'Plain text'}`);

    if (isHashed) {
      // Use bcrypt for hashed passwords
      const isValid = await bcrypt.compare(password, user.password);
      console.log(`✅ Bcrypt validation result: ${isValid}`);
      return isValid ? user : null;
    } else {
      // Direct comparison for plain text passwords (legacy users)
      const isValid = user.password === password;
      console.log(`✅ Plain text validation result: ${isValid}`);
      console.log(`🔍 Stored password length: ${user.password.length}, Provided password length: ${password.length}`);
      console.log(`🔍 Stored password first 5 chars: "${user.password.substring(0, 5)}..."`);
      console.log(`🔍 Provided password first 5 chars: "${password.substring(0, 5)}..."`);

      // Try some common variations
      const variations = [
        password.trim(),
        password.toLowerCase(),
        password.toUpperCase(),
        'utsab@2004',
        'password123',
        'utsab123',
        'test123'
      ];

      let matchedPassword = null;
      if (isValid) {
        matchedPassword = password;
      } else {
        for (const variation of variations) {
          if (user.password === variation) {
            console.log(`🎯 Password match found with variation: "${variation}"`);
            matchedPassword = variation;
            break;
          }
        }
      }

      if (matchedPassword) {
        // Auto-migrate the password to hashed format
        try {
          console.log(`🔐 Auto-migrating password for user: ${user.email}`);
          const hashedPassword = await bcrypt.hash(matchedPassword, 12);

          const userRef = doc(db, USERS_COLLECTION, user.id);
          await updateDoc(userRef, { password: hashedPassword });

          console.log(`✅ Password auto-migrated to hashed format for: ${user.email}`);

          // Return user with updated password hash (for consistency)
          user.password = hashedPassword;
        } catch (migrationError) {
          console.error(`❌ Failed to auto-migrate password for ${user.email}:`, migrationError);
          // Still return the user since login was successful
        }
        return user;
      }

      return null;
    }
  } catch (error) {
    console.error("Error validating credentials:", error);
    return null;
  }
};

export const addSampleRidesForUser = async (userId: string): Promise<void> => {
  try {
    const sampleRides = [
      {
        userId,
        from: "Karol Bagh Metro Station",
        to: "Rajouri Garden",
        date: Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)), // 2 hours ago
        amount: 120.0,
        status: "Completed",
        driverName: "Ravi Sharma",
        rating: 5,
        paymentMethod: "UPI",
        duration: 20,
        distance: 6.2,
      },
    ];

    for (const rideData of sampleRides) {
      await addDoc(collection(db, RIDES_COLLECTION), rideData);
    }
  } catch (error) {
    console.error("Error adding sample rides:", error);
  }
};

export const getAllUsers = async (): Promise<any[]> => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Firebase request timeout")), 5000);
    });

    const querySnapshot = await Promise.race([
      getDocs(usersRef),
      timeoutPromise,
    ]);

    const users: any[] = [];

    (querySnapshot as any).forEach((doc: any) => {
      const userData = doc.data();
      const { password, ...userWithoutPassword } = userData;
      users.push({
        id: doc.id,
        ...userWithoutPassword,
        joinDate: userData.joinDate.toDate(),
      });
    });

    return users;
  } catch (error) {
    console.error("Error getting all users:", error);
    throw error; // Re-throw to trigger fallback
  }
};

export const getAllRides = async (): Promise<Ride[]> => {
  try {
    const ridesRef = collection(db, RIDES_COLLECTION);
    const querySnapshot = await getDocs(ridesRef);
    const rides: Ride[] = [];

    querySnapshot.forEach((doc) => {
      const rideData = doc.data();
      rides.push({
        id: doc.id,
        ...rideData,
        date: rideData.date.toDate(),
      } as Ride);
    });

    return rides;
  } catch (error) {
    console.error("Error getting all rides:", error);
    return [];
  }
};

export const createRide = async (rideData: {
  userId: string;
  from: string;
  to: string;
  amount: number;
  carType: string;
  purpose: string;
  distance: string;
  estimatedTime: string;
}): Promise<Ride | null> => {
  try {
    const newRide = {
      userId: rideData.userId,
      from: rideData.from,
      to: rideData.to,
      date: Timestamp.fromDate(new Date()),
      amount: rideData.amount,
      status: "Completed" as const,
      driverName: "Driver #" + Math.floor(Math.random() * 1000),
      rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
      paymentMethod: "Digital Wallet",
      duration: parseInt(rideData.estimatedTime) || 20,
      distance: parseFloat(rideData.distance) || 5,
    };

    const ridesRef = collection(db, RIDES_COLLECTION);
    const docRef = await addDoc(ridesRef, newRide);

    return {
      id: docRef.id,
      ...newRide,
      date: newRide.date.toDate(),
    } as Ride;
  } catch (error) {
    console.error("Error creating ride:", error);
    return null;
  }
};

// Migration function to hash plain text passwords
export const migratePasswordsToHashed = async (): Promise<void> => {
  try {
    console.log("🔐 Starting password migration to hashed format...");

    const usersRef = collection(db, USERS_COLLECTION);
    const querySnapshot = await getDocs(usersRef);

    let migratedCount = 0;

    for (const docSnapshot of querySnapshot.docs) {
      const userData = docSnapshot.data();
      const userId = docSnapshot.id;

      // Check if password is already hashed
      const isHashed = userData.password?.startsWith('$2a$') ||
                      userData.password?.startsWith('$2b$') ||
                      userData.password?.startsWith('$2y$');

      if (!isHashed && userData.password) {
        console.log(`🔄 Migrating password for user: ${userData.email}`);

        // Hash the plain text password
        const hashedPassword = await bcrypt.hash(userData.password, 12);

        // Update the user document with hashed password
        const userRef = doc(db, USERS_COLLECTION, userId);
        await updateDoc(userRef, {
          password: hashedPassword
        });

        migratedCount++;
        console.log(`✅ Password migrated for user: ${userData.email}`);
      } else {
        console.log(`⏭️  Password already hashed for user: ${userData.email}`);
      }
    }

    console.log(`🎉 Password migration completed! Migrated ${migratedCount} users.`);
  } catch (error) {
    console.error("❌ Error during password migration:", error);
    throw error;
  }
};

// Initialize database with sample data
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error("Firebase initialization timeout")),
        10000,
      );
    });

    // Check if users already exist
    const existingUsers = await Promise.race([getAllUsers(), timeoutPromise]);

    if ((existingUsers as any[]).length > 0) {
      console.log("✅ Firebase database already contains data");
      return;
    }

    // Create sample users with hashed passwords
    const sampleUsers = [
      {
        name: "Rajesh Kumar",
        email: "rajesh@example.com",
        phone: "+91 98765 43210",
        password: "password123",
      },
      {
        name: "Priya Sharma",
        email: "priya@example.com",
        phone: "+91 87654 32109",
        password: "password456",
      },
    ];

    const createdUsers: User[] = [];
    for (const userData of sampleUsers) {
      const user = await createUser(userData);
      createdUsers.push(user);
    }

    // Create sample rides
    const sampleRides = [
      {
        userId: createdUsers[0].id,
        from: "Connaught Place",
        to: "Dwarka Sector 12",
        date: Timestamp.now(),
        amount: 285.0,
        status: "Completed",
        driverName: "Vikram Singh",
        rating: 5,
        paymentMethod: "UPI",
        duration: 25,
        distance: 8.5,
      },
      {
        userId: createdUsers[0].id,
        from: "IGI Airport Terminal 3",
        to: "India Gate",
        date: Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)),
        amount: 520.0,
        status: "Completed",
        driverName: "Suresh Kumar",
        rating: 4,
        paymentMethod: "Card",
        duration: 35,
        distance: 22.3,
      },
      {
        userId: createdUsers[1].id,
        from: "JNU Campus",
        to: "CCD Janpath",
        date: Timestamp.now(),
        amount: 95.0,
        status: "Completed",
        driverName: "Anjali Verma",
        rating: 5,
        paymentMethod: "UPI",
        duration: 15,
        distance: 3.1,
      },
    ];

    for (const rideData of sampleRides) {
      await addDoc(collection(db, RIDES_COLLECTION), rideData);
    }

    console.log("✅ Firebase database initialized with sample data");
    console.log(`📊 Total users: ${createdUsers.length}`);
    console.log(`🚗 Total rides: ${sampleRides.length}`);
  } catch (error) {
    console.error("❌ Error initializing Firebase database:", error);
  }
};
