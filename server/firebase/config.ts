import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAmRDzRrbvHH5LqkXv0-5Bxtsw3ynqfm4s",
  authDomain: "uride-cab-service.firebaseapp.com",
  projectId: "uride-cab-service",
  storageBucket: "uride-cab-service.firebasestorage.app",
  messagingSenderId: "552199078858",
  appId: "1:552199078858:web:c1db2f2429f6b3a3f64533",
  measurementId: "G-Q14PG2EC6L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
