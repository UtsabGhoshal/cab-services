import { useState, useEffect } from "react";
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "@/firebase/config";
import {
  firebaseDriverService,
  type FirebaseDriver,
} from "@/services/firebaseDriverService";

interface DriverAuthState {
  user: User | null;
  driver: FirebaseDriver | null;
  loading: boolean;
  error: string | null;
}

export const useFirebaseAuth = () => {
  const [authState, setAuthState] = useState<DriverAuthState>({
    user: null,
    driver: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get driver profile from Firestore
          const driver = await firebaseDriverService.getDriverByEmail(
            user.email!,
          );
          setAuthState({
            user,
            driver,
            loading: false,
            error: driver ? null : "Driver profile not found",
          });
        } catch (error) {
          console.error("Error loading driver profile:", error);
          setAuthState({
            user,
            driver: null,
            loading: false,
            error: "Failed to load driver profile",
          });
        }
      } else {
        setAuthState({
          user: null,
          driver: null,
          loading: false,
          error: null,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem("uride_driver");
      localStorage.removeItem("uride_driver_token");
      localStorage.removeItem("uride_driver_remember");
      return { success: true };
    } catch (error) {
      console.error("Sign out error:", error);
      return { success: false, error: "Failed to sign out" };
    }
  };

  return {
    ...authState,
    signOut,
    isAuthenticated: !!authState.user,
    isDriverActive: authState.driver?.status === "active",
  };
};
