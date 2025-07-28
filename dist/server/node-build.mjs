import path from "path";
import * as express from "express";
import express__default, { Router } from "express";
import cors from "cors";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, Timestamp, addDoc, orderBy, limit } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
const handleDemo = (req, res) => {
  const response = {
    message: "Hello from Express server"
  };
  res.status(200).json(response);
};
let databaseType = "firebase";
const getDatabaseService = async () => {
  if (databaseType === "firebase") {
    try {
      const firebaseDb = await Promise.resolve().then(() => firebaseDatabase);
      await firebaseDb.getAllUsers();
      return firebaseDb;
    } catch (error) {
      console.warn("⚠️ Firebase not accessible, falling back to mock database");
      console.log(
        "🔧 To use Firebase, ensure Firestore is enabled in your Firebase console"
      );
      databaseType = "mock";
      return await import("./mockDatabase-CFUBcPxd.js");
    }
  } else {
    return await import("./mockDatabase-CFUBcPxd.js");
  }
};
const getUserById$1 = async (id) => {
  const db2 = await getDatabaseService();
  return db2.getUserById(id);
};
const getUserByEmail$1 = async (email) => {
  const db2 = await getDatabaseService();
  return db2.getUserByEmail(email);
};
const createUser$1 = async (userData) => {
  const db2 = await getDatabaseService();
  return db2.createUser(userData);
};
const getUserRides$1 = async (userId, limit2) => {
  const db2 = await getDatabaseService();
  return db2.getUserRides(userId, limit2);
};
const getUserStats$1 = async (userId) => {
  const db2 = await getDatabaseService();
  return db2.getUserStats(userId);
};
const validateUserCredentials$1 = async (email, password) => {
  const db2 = await getDatabaseService();
  return db2.validateUserCredentials(email, password);
};
const getAllUsers$1 = async () => {
  const db2 = await getDatabaseService();
  return db2.getAllUsers();
};
const getAllRides$1 = async () => {
  const db2 = await getDatabaseService();
  return db2.getAllRides();
};
const addSampleRidesForUser$1 = async (userId) => {
  const db2 = await getDatabaseService();
  if (db2.addSampleRidesForUser) {
    return db2.addSampleRidesForUser(userId);
  }
};
const databaseService = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  addSampleRidesForUser: addSampleRidesForUser$1,
  createUser: createUser$1,
  getAllRides: getAllRides$1,
  getAllUsers: getAllUsers$1,
  getDatabaseService,
  getUserByEmail: getUserByEmail$1,
  getUserById: getUserById$1,
  getUserRides: getUserRides$1,
  getUserStats: getUserStats$1,
  validateUserCredentials: validateUserCredentials$1
}, Symbol.toStringTag, { value: "Module" }));
const loginHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({
        success: false,
        error: "Email and password are required"
      });
    }
    const user = await validateUserCredentials$1(email, password);
    if (!user) {
      return res.json({
        success: false,
        error: "Invalid email or password"
      });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Login error:", error);
    res.json({
      success: false,
      error: "An error occurred during login"
    });
  }
};
const signupHandler = async (req, res) => {
  try {
    if (res.headersSent) {
      console.warn("Headers already sent in signup handler");
      return;
    }
    const { name, email, phone, password, dateOfBirth, address } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        error: "Name, email, phone, and password are required"
      });
    }
    const existingUser = await getUserByEmail$1(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "User with this email already exists"
      });
    }
    const userCreateData = {
      name,
      email,
      phone,
      password
      // In real app, hash the password
    };
    if (dateOfBirth !== void 0) {
      userCreateData.dateOfBirth = dateOfBirth;
    }
    if (address !== void 0) {
      userCreateData.address = address;
    }
    const newUser = await createUser$1(userCreateData);
    try {
      const { addSampleRidesForUser: addSampleRidesForUser2 } = await Promise.resolve().then(() => databaseService);
      if (addSampleRidesForUser2) {
        await addSampleRidesForUser2(newUser.id);
      }
    } catch (error) {
      console.log("Sample rides not added:", error.message);
    }
    const { password: _, ...userObj } = newUser;
    if (!res.headersSent) {
      res.status(201).json({
        success: true,
        user: userObj
      });
    }
  } catch (error) {
    console.error("Signup error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: "An error occurred during signup"
      });
    }
  }
};
const getUserDataHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.json({
        success: false,
        error: "User ID is required"
      });
    }
    const user = await getUserById$1(userId);
    if (!user) {
      return res.json({
        success: false,
        error: "User not found"
      });
    }
    const recentRides = await getUserRides$1(userId, 5);
    const stats = await getUserStats$1(userId);
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      user: userWithoutPassword,
      recentRides,
      stats
    });
  } catch (error) {
    console.error("Get user data error:", error);
    res.json({
      success: false,
      error: "An error occurred while fetching user data"
    });
  }
};
const getUserRidesHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const limit2 = parseInt(req.query.limit) || 10;
    if (!userId) {
      return res.json({
        success: false,
        error: "User ID is required"
      });
    }
    const rides = await getUserRides$1(userId, limit2);
    res.json({
      success: true,
      rides
    });
  } catch (error) {
    console.error("Get user rides error:", error);
    res.json({
      success: false,
      error: "An error occurred while fetching rides"
    });
  }
};
const router$1 = Router();
router$1.get("/", async (_req, res) => {
  try {
    const rides = await getAllRides$1();
    res.status(200).json({
      success: true,
      message: "Rides retrieved successfully",
      data: rides
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching rides",
      error: error.message
    });
  }
});
const router = express__default.Router();
router.get("/", async (_req, res) => {
  try {
    const users = await getAllUsers$1();
    res.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, error: "Failed to fetch users" });
  }
});
router.post("/", async (req, res) => {
  try {
    const user = await createUser$1(req.body);
    res.status(201).json({ success: true, user });
  } catch (error) {
    if (error.name === "ValidationError") {
      console.error("Validation error creating user:", error);
      res.status(400).json({ success: false, error: error.message });
    } else {
      console.error("Error creating user:", error);
      res.status(500).json({ success: false, error: "Failed to create user", details: error.message });
    }
  }
});
router.get("/:userId", async (req, res) => {
  try {
    const user = await getUserById$1(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ success: false, error: "Failed to fetch user" });
  }
});
const firebaseConfig = {
  apiKey: "AIzaSyAmRDzRrbvHH5LqkXv0-5Bxtsw3ynqfm4s",
  authDomain: "uride-cab-service.firebaseapp.com",
  projectId: "uride-cab-service",
  storageBucket: "uride-cab-service.firebasestorage.app",
  messagingSenderId: "552199078858",
  appId: "1:552199078858:web:c1db2f2429f6b3a3f64533",
  measurementId: "G-Q14PG2EC6L"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
getAuth(app);
const USERS_COLLECTION = "users";
const RIDES_COLLECTION = "rides";
const getUserByEmail = async (email) => {
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
      joinDate: userData.joinDate.toDate()
    };
  } catch (error) {
    console.error("Error getting user by email:", error);
    return null;
  }
};
const getUserById = async (id) => {
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
      joinDate: userData.joinDate.toDate()
    };
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return null;
  }
};
const createUser = async (userData) => {
  try {
    const cleanedUserData = Object.fromEntries(
      Object.entries(userData).filter(([_, value]) => value !== void 0)
    );
    const newUser = {
      ...cleanedUserData,
      joinDate: Timestamp.now(),
      memberLevel: "Bronze",
      isActive: true
    };
    const docRef = await addDoc(collection(db, USERS_COLLECTION), newUser);
    return {
      id: docRef.id,
      ...newUser,
      joinDate: newUser.joinDate.toDate()
    };
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};
const getUserRides = async (userId, limitCount = 10) => {
  try {
    const ridesRef = collection(db, RIDES_COLLECTION);
    const q = query(
      ridesRef,
      where("userId", "==", userId),
      orderBy("date", "desc"),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    const rides = [];
    querySnapshot.forEach((doc2) => {
      const rideData = doc2.data();
      rides.push({
        id: doc2.id,
        ...rideData,
        date: rideData.date.toDate()
      });
    });
    return rides;
  } catch (error) {
    console.error("Error getting user rides:", error);
    return [];
  }
};
const getUserStats = async (userId) => {
  try {
    const userRides = await getUserRides(userId, 1e3);
    const user = await getUserById(userId);
    const totalRides = userRides.length;
    const totalSpent = userRides.reduce((sum, ride) => sum + ride.amount, 0);
    const ratingsSum = userRides.reduce(
      (sum, ride) => sum + (ride.rating || 0),
      0
    );
    const averageRating = totalRides > 0 ? ratingsSum / totalRides : 0;
    return {
      totalRides,
      totalSpent,
      averageRating,
      memberLevel: user?.memberLevel || "Bronze",
      joinDate: user?.joinDate || /* @__PURE__ */ new Date()
    };
  } catch (error) {
    console.error("Error getting user stats:", error);
    return {
      totalRides: 0,
      totalSpent: 0,
      averageRating: 0,
      memberLevel: "Bronze",
      joinDate: /* @__PURE__ */ new Date()
    };
  }
};
const validateUserCredentials = async (email, password) => {
  try {
    const user = await getUserByEmail(email);
    if (user && user.password === password) {
      return user;
    }
    return null;
  } catch (error) {
    console.error("Error validating credentials:", error);
    return null;
  }
};
const addSampleRidesForUser = async (userId) => {
  try {
    const sampleRides = [
      {
        userId,
        from: "Karol Bagh Metro Station",
        to: "Rajouri Garden",
        date: Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1e3)),
        // 2 hours ago
        amount: 120,
        status: "Completed",
        driverName: "Ravi Sharma",
        rating: 5,
        paymentMethod: "UPI",
        duration: 20,
        distance: 6.2
      }
    ];
    for (const rideData of sampleRides) {
      await addDoc(collection(db, RIDES_COLLECTION), rideData);
    }
  } catch (error) {
    console.error("Error adding sample rides:", error);
  }
};
const getAllUsers = async () => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Firebase request timeout")), 5e3);
    });
    const querySnapshot = await Promise.race([
      getDocs(usersRef),
      timeoutPromise
    ]);
    const users = [];
    querySnapshot.forEach((doc2) => {
      const userData = doc2.data();
      const { password, ...userWithoutPassword } = userData;
      users.push({
        id: doc2.id,
        ...userWithoutPassword,
        joinDate: userData.joinDate.toDate()
      });
    });
    return users;
  } catch (error) {
    console.error("Error getting all users:", error);
    throw error;
  }
};
const getAllRides = async () => {
  try {
    const ridesRef = collection(db, RIDES_COLLECTION);
    const querySnapshot = await getDocs(ridesRef);
    const rides = [];
    querySnapshot.forEach((doc2) => {
      const rideData = doc2.data();
      rides.push({
        id: doc2.id,
        ...rideData,
        date: rideData.date.toDate()
      });
    });
    return rides;
  } catch (error) {
    console.error("Error getting all rides:", error);
    return [];
  }
};
const initializeDatabase = async () => {
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error("Firebase initialization timeout")),
        1e4
      );
    });
    const existingUsers = await Promise.race([getAllUsers(), timeoutPromise]);
    if (existingUsers.length > 0) {
      console.log("✅ Firebase database already contains data");
      return;
    }
    const sampleUsers = [
      {
        name: "Rajesh Kumar",
        email: "rajesh@example.com",
        phone: "+91 98765 43210",
        password: "password123"
      },
      {
        name: "Priya Sharma",
        email: "priya@example.com",
        phone: "+91 87654 32109",
        password: "password456"
      }
    ];
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = await createUser(userData);
      createdUsers.push(user);
    }
    const sampleRides = [
      {
        userId: createdUsers[0].id,
        from: "Connaught Place",
        to: "Dwarka Sector 12",
        date: Timestamp.now(),
        amount: 285,
        status: "Completed",
        driverName: "Vikram Singh",
        rating: 5,
        paymentMethod: "UPI",
        duration: 25,
        distance: 8.5
      },
      {
        userId: createdUsers[0].id,
        from: "IGI Airport Terminal 3",
        to: "India Gate",
        date: Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1e3)),
        amount: 520,
        status: "Completed",
        driverName: "Suresh Kumar",
        rating: 4,
        paymentMethod: "Card",
        duration: 35,
        distance: 22.3
      },
      {
        userId: createdUsers[1].id,
        from: "JNU Campus",
        to: "CCD Janpath",
        date: Timestamp.now(),
        amount: 95,
        status: "Completed",
        driverName: "Anjali Verma",
        rating: 5,
        paymentMethod: "UPI",
        duration: 15,
        distance: 3.1
      }
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
const firebaseDatabase = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  addSampleRidesForUser,
  createUser,
  getAllRides,
  getAllUsers,
  getUserByEmail,
  getUserById,
  getUserRides,
  getUserStats,
  initializeDatabase,
  validateUserCredentials
}, Symbol.toStringTag, { value: "Module" }));
async function createServer() {
  const app2 = express__default();
  try {
    console.log("🔥 Initializing Firebase database...");
    await initializeDatabase();
    console.log("✅ Firebase database initialized successfully");
  } catch (error) {
    console.warn(
      "⚠️ Firebase not available, using mock database for development"
    );
    console.log("🔧 Error:", error.message);
    const { initializeDatabase: initMockDb } = await import("./mockDatabase-CFUBcPxd.js");
    initMockDb();
  }
  app2.use(cors());
  app2.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
  app2.use(express__default.json({ limit: "10mb" }));
  app2.use(express__default.urlencoded({ extended: true, limit: "10mb" }));
  app2.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });
  app2.get("/api/demo", handleDemo);
  app2.post("/api/auth/login", loginHandler);
  app2.post("/api/auth/signup", signupHandler);
  app2.get("/api/user/:userId/data", getUserDataHandler);
  app2.get("/api/user/:userId/rides", getUserRidesHandler);
  app2.use("/api/users", router);
  app2.use("/api/rides", router$1);
  app2.get("/api/admin/users", async (_req, res) => {
    try {
      const { getAllUsers: getAllUsers2 } = await Promise.resolve().then(() => databaseService);
      const users = await getAllUsers2();
      res.json({ success: true, users });
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ success: false, error: "Failed to fetch users" });
    }
  });
  app2.get("/api/admin/rides", async (_req, res) => {
    try {
      const { getAllRides: getAllRides2 } = await Promise.resolve().then(() => databaseService);
      const rides = await getAllRides2();
      res.json({ success: true, rides });
    } catch (error) {
      console.error("Error fetching all rides:", error);
      res.status(500).json({ success: false, error: "Failed to fetch rides" });
    }
  });
  return app2;
}
async function startServer() {
  try {
    const app2 = await createServer();
    const port = process.env.PORT || 3e3;
    const __dirname = import.meta.dirname;
    const distPath = path.join(__dirname, "../spa");
    app2.use(express.static(distPath));
    app2.get("*", (req, res) => {
      if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
        return res.status(404).json({ error: "API endpoint not found" });
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
    app2.listen(port, () => {
      console.log(`🚀 QuickRide server running on port ${port}`);
      console.log(`📱 Frontend: http://localhost:${port}`);
      console.log(`🔧 API: http://localhost:${port}/api`);
      console.log(`🗃️ Database: Firebase`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}
startServer();
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});
process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
//# sourceMappingURL=node-build.mjs.map
