import { User, Ride, UserStats } from "@shared/database";

// Pure in-memory database for QuickRide application
// All data is stored in memory and will reset when server restarts

let users: User[] = [
  {
    id: "user_1",
    name: "Rajesh Kumar",
    email: "rajesh@example.com",
    phone: "+91 98765 43210",
    password: "password123", // In real app, this would be hashed
    joinDate: new Date("2024-01-15"),
    memberLevel: "Gold",
    isActive: true,
  },
  {
    id: "user_2",
    name: "Priya Sharma",
    email: "priya@example.com",
    phone: "+91 87654 32109",
    password: "password456",
    joinDate: new Date("2024-03-20"),
    memberLevel: "Silver",
    isActive: true,
  },
];

let rides: Ride[] = [
  {
    id: "ride_1",
    userId: "user_1",
    from: "Connaught Place",
    to: "Dwarka Sector 12",
    date: new Date(),
    amount: 285.0,
    status: "Completed",
    driverName: "Vikram Singh",
    rating: 5,
    paymentMethod: "UPI",
    duration: 25,
    distance: 8.5,
  },
  {
    id: "ride_2",
    userId: "user_1",
    from: "IGI Airport Terminal 3",
    to: "India Gate",
    date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    amount: 520.0,
    status: "Completed",
    driverName: "Suresh Kumar",
    rating: 4,
    paymentMethod: "Card",
    duration: 35,
    distance: 22.3,
  },
  {
    id: "ride_3",
    userId: "user_1",
    from: "Select City Walk Mall",
    to: "Khan Market",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    amount: 145.0,
    status: "Completed",
    driverName: "Ramesh Gupta",
    rating: 5,
    paymentMethod: "Cash",
    duration: 18,
    distance: 5.2,
  },
  {
    id: "ride_4",
    userId: "user_2",
    from: "JNU Campus",
    to: "CCD Janpath",
    date: new Date(),
    amount: 95.0,
    status: "Completed",
    driverName: "Anjali Verma",
    rating: 5,
    paymentMethod: "UPI",
    duration: 15,
    distance: 3.1,
  },
];

// Pure in-memory database operations
// No external database dependencies - all data stored in arrays
export const getUserByEmail = async (email: string): Promise<User | null> => {
  return users.find((user) => user.email === email) || null;
};

export const getUserById = async (id: string): Promise<User | null> => {
  return users.find((user) => user.id === id) || null;
};

export const createUser = async (
  userData: Omit<User, "id" | "joinDate" | "memberLevel" | "isActive">,
): Promise<User> => {
  const newUser: User = {
    ...userData,
    id: `user_${Date.now()}`,
    joinDate: new Date(),
    memberLevel: "Bronze",
    isActive: true,
  };

  users.push(newUser);
  return newUser;
};

export const getUserRides = async (
  userId: string,
  limit: number = 10,
): Promise<Ride[]> => {
  return rides
    .filter((ride) => ride.userId === userId)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);
};

export const getUserStats = async (userId: string): Promise<UserStats> => {
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
};

export const validateUserCredentials = async (
  email: string,
  password: string,
): Promise<User | null> => {
  const user = await getUserByEmail(email);
  if (user && user.password === password) {
    // In real app, you'd compare hashed passwords
    return user;
  }
  return null;
};

// Helper function to add sample rides for new users
export const addSampleRidesForUser = async (userId: string) => {
  const sampleRides: Omit<Ride, "id" | "userId">[] = [
    {
      from: "Karol Bagh Metro Station",
      to: "Rajouri Garden",
      date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
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
    const newRide: Ride = {
      ...rideData,
      id: `ride_${Date.now()}_${Math.random()}`,
      userId,
    };
    rides.push(newRide);
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
    const newRide: Ride = {
      id: `ride_${Date.now()}_${Math.random()}`,
      userId: rideData.userId,
      from: rideData.from,
      to: rideData.to,
      date: new Date(),
      amount: rideData.amount,
      status: "Completed",
      driverName: "Driver #" + Math.floor(Math.random() * 1000),
      rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
      paymentMethod: "Digital Wallet",
      duration: parseInt(rideData.estimatedTime) || 20,
      distance: parseFloat(rideData.distance) || 5,
    };

    rides.push(newRide);
    return newRide;
  } catch (error) {
    console.error("Error creating ride:", error);
    return null;
  }
};

// Initialize database with additional sample data
export const initializeDatabase = () => {
  // Add more sample rides for demonstration
  const additionalRides: Ride[] = [
    {
      id: "ride_5",
      userId: "user_1",
      from: "The Oberoi Hotel",
      to: "Pragati Maidan",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      amount: 380.0,
      status: "Completed",
      driverName: "Deepak Joshi",
      rating: 4,
      paymentMethod: "Card",
      duration: 28,
      distance: 12.1,
    },
    {
      id: "ride_6",
      userId: "user_1",
      from: "Gold's Gym Lajpat Nagar",
      to: "Big Bazaar CR Park",
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      amount: 165.0,
      status: "Completed",
      driverName: "Meera Patel",
      rating: 5,
      paymentMethod: "Cash",
      duration: 22,
      distance: 7.3,
    },
  ];

  rides.push(...additionalRides);
  console.log("✅ In-memory database initialized with sample data");
  console.log(`📊 Total users: ${users.length}`);
  console.log(`🚗 Total rides: ${rides.length}`);
};

// Get all users (for admin/debug purposes)
export const getAllUsers = async (): Promise<User[]> => {
  return users.map(({ password, ...user }) => user as any);
};

// Get all rides (for admin/debug purposes)
export const getAllRides = async (): Promise<Ride[]> => {
  return rides;
};
