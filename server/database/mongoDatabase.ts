import mongoose from "mongoose";
import { User, Ride, IUser, IRide } from "./models";
import { UserStats } from "@shared/database";

// MongoDB database operations replacing the mock database

export const getUserByEmail = async (email: string): Promise<IUser | null> => {
  try {
    const user = await User.findOne({ email, isActive: true });
    return user;
  } catch (error) {
    console.error("Error finding user by email:", error);
    return null;
  }
};

export const getUserById = async (id: string): Promise<IUser | null> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const user = await User.findById(id);
    return user;
  } catch (error) {
    console.error("Error finding user by ID:", error);
    return null;
  }
};

export const createUser = async (userData: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  dateOfBirth?: string;
  address?: string;
}): Promise<IUser> => {
  try {
    const newUser = new User({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      dateOfBirth: userData.dateOfBirth,
      address: userData.address,
      joinDate: new Date(),
      memberLevel: "Bronze",
      isActive: true,
    });

    const savedUser = await newUser.save();
    return savedUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const getUserRides = async (
  userId: string,
  limit: number = 10,
): Promise<IRide[]> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return [];
    }

    const rides = await Ride.find({ userId }).sort({ date: -1 }).limit(limit);

    return rides;
  } catch (error) {
    console.error("Error fetching user rides:", error);
    return [];
  }
};

export const getUserStats = async (userId: string): Promise<UserStats> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return {
        totalRides: 0,
        totalSpent: 0,
        averageRating: 0,
        memberLevel: "Bronze",
        joinDate: new Date(),
      };
    }

    const user = await User.findById(userId);
    if (!user) {
      return {
        totalRides: 0,
        totalSpent: 0,
        averageRating: 0,
        memberLevel: "Bronze",
        joinDate: new Date(),
      };
    }

    const rideStats = await Ride.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalRides: { $sum: 1 },
          totalSpent: { $sum: "$amount" },
          ratingsSum: { $sum: "$rating" },
          ratingsCount: {
            $sum: { $cond: [{ $ne: ["$rating", null] }, 1, 0] },
          },
        },
      },
    ]);

    const stats = rideStats[0] || {
      totalRides: 0,
      totalSpent: 0,
      ratingsSum: 0,
      ratingsCount: 0,
    };

    const averageRating =
      stats.ratingsCount > 0 ? stats.ratingsSum / stats.ratingsCount : 0;

    return {
      totalRides: stats.totalRides,
      totalSpent: stats.totalSpent,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      memberLevel: user.memberLevel,
      joinDate: user.joinDate,
    };
  } catch (error) {
    console.error("Error calculating user stats:", error);
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
): Promise<IUser | null> => {
  try {
    // Find user with password field included
    const user = await User.findOne({ email, isActive: true }).select(
      "+password",
    );

    if (!user) {
      return null;
    }

    // Compare password using the model method
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return null;
    }

    // Return user without password
    const userObj = user.toObject();
    delete userObj.password;
    return userObj as IUser;
  } catch (error) {
    console.error("Error validating user credentials:", error);
    return null;
  }
};

export const addSampleRidesForUser = async (userId: string): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return;
    }

    const sampleRides = [
      {
        userId: new mongoose.Types.ObjectId(userId),
        from: "Welcome Location",
        to: "First Destination",
        date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        amount: 15.75,
        status: "Completed" as const,
        driverName: "Welcome Driver",
        rating: 5,
        paymentMethod: "Card",
        duration: 20,
        distance: 6.2,
      },
    ];

    await Ride.insertMany(sampleRides);
    console.log(
      `✅ Added ${sampleRides.length} sample rides for user ${userId}`,
    );
  } catch (error) {
    console.error("Error adding sample rides:", error);
  }
};

// Initialize database with sample data
export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log("🔧 Initializing MongoDB database...");

    // Check if users already exist
    const existingUsersCount = await User.countDocuments();

    if (existingUsersCount > 0) {
      console.log(
        `📊 Database already has ${existingUsersCount} users. Skipping initialization.`,
      );
      return;
    }

    console.log("🏗️ Creating sample users and rides...");

    // Create sample users
    const sampleUsers = [
      {
        name: "John Smith",
        email: "john@example.com",
        phone: "+1234567890",
        password: "password123",
        memberLevel: "Gold" as const,
      },
      {
        name: "Sarah Johnson",
        email: "sarah@example.com",
        phone: "+1987654321",
        password: "password456",
        memberLevel: "Silver" as const,
      },
    ];

    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`✅ Created ${createdUsers.length} sample users`);

    // Create sample rides for John Smith
    const johnUser = createdUsers.find(
      (user) => user.email === "john@example.com",
    );
    if (johnUser) {
      const sampleRides = [
        {
          userId: johnUser._id,
          from: "Downtown Office",
          to: "Home",
          date: new Date(),
          amount: 24.5,
          status: "Completed" as const,
          driverName: "Mike Wilson",
          rating: 5,
          paymentMethod: "Card",
          duration: 25,
          distance: 8.5,
        },
        {
          userId: johnUser._id,
          from: "Airport Terminal 1",
          to: "City Center",
          date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
          amount: 45.8,
          status: "Completed" as const,
          driverName: "David Chen",
          rating: 4,
          paymentMethod: "Card",
          duration: 35,
          distance: 22.3,
        },
        {
          userId: johnUser._id,
          from: "Shopping Mall",
          to: "Restaurant District",
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          amount: 18.3,
          status: "Completed" as const,
          driverName: "Alex Rodriguez",
          rating: 5,
          paymentMethod: "Cash",
          duration: 18,
          distance: 5.2,
        },
        {
          userId: johnUser._id,
          from: "Hotel Plaza",
          to: "Conference Center",
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
          amount: 32.4,
          status: "Completed" as const,
          driverName: "Jennifer Adams",
          rating: 4,
          paymentMethod: "Card",
          duration: 28,
          distance: 12.1,
        },
      ];

      await Ride.insertMany(sampleRides);
      console.log(
        `✅ Created ${sampleRides.length} sample rides for John Smith`,
      );
    }

    // Create sample ride for Sarah Johnson
    const sarahUser = createdUsers.find(
      (user) => user.email === "sarah@example.com",
    );
    if (sarahUser) {
      const sarahRides = [
        {
          userId: sarahUser._id,
          from: "University Campus",
          to: "Coffee Shop",
          date: new Date(),
          amount: 12.4,
          status: "Completed" as const,
          driverName: "Emma Davis",
          rating: 5,
          paymentMethod: "Card",
          duration: 15,
          distance: 3.1,
        },
      ];

      await Ride.insertMany(sarahRides);
      console.log(
        `✅ Created ${sarahRides.length} sample rides for Sarah Johnson`,
      );
    }

    console.log("🎉 Database initialization completed successfully!");

    // Log final counts
    const totalUsers = await User.countDocuments();
    const totalRides = await Ride.countDocuments();
    console.log(`📊 Total users: ${totalUsers}`);
    console.log(`🚗 Total rides: ${totalRides}`);
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    throw error;
  }
};

// Admin/Debug functions
export const getAllUsers = async (): Promise<IUser[]> => {
  try {
    const users = await User.find({ isActive: true }).sort({ joinDate: -1 });
    return users;
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
};

export const getAllRides = async (): Promise<IRide[]> => {
  try {
    const rides = await Ride.find()
      .populate("userId", "name email")
      .sort({ date: -1 });
    return rides;
  } catch (error) {
    console.error("Error fetching all rides:", error);
    return [];
  }
};
