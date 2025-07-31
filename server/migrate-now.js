const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
} = require("firebase/firestore");
const bcrypt = require("bcryptjs");

// Firebase config (same as in your app)
const firebaseConfig = {
  apiKey: "AIzaSyBb8S8bU9WjfI-JdO2dD5qJpR5QyA5i0R8",
  authDomain: "uride-firebase-v1.firebaseapp.com",
  projectId: "uride-firebase-v1",
  storageBucket: "uride-firebase-v1.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
};

async function migratePasswords() {
  try {
    console.log("🔥 Initializing Firebase...");
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log("🔐 Starting password migration...");

    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);

    let migratedCount = 0;

    for (const docSnapshot of querySnapshot.docs) {
      const userData = docSnapshot.data();
      const userId = docSnapshot.id;

      console.log(`📋 Processing user: ${userData.email}`);
      console.log(`🔍 Current password: "${userData.password}"`);

      // Check if password is already hashed
      const isHashed =
        userData.password?.startsWith("$2a$") ||
        userData.password?.startsWith("$2b$") ||
        userData.password?.startsWith("$2y$");

      if (!isHashed && userData.password) {
        console.log(`🔄 Migrating password for user: ${userData.email}`);

        // Hash the plain text password
        const hashedPassword = await bcrypt.hash(userData.password, 12);

        console.log(
          `🔐 New hashed password: ${hashedPassword.substring(0, 20)}...`,
        );

        // Update the user document with hashed password
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
          password: hashedPassword,
        });

        migratedCount++;
        console.log(`✅ Password migrated for user: ${userData.email}`);
      } else {
        console.log(`⏭️  Password already hashed for user: ${userData.email}`);
      }
    }

    console.log(
      `🎉 Password migration completed! Migrated ${migratedCount} users.`,
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during password migration:", error);
    process.exit(1);
  }
}

migratePasswords();
