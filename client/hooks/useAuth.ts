import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase/config";

interface AuthUser {
  uid: string;
  email: string | null;
  [key: string]: any;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage first for stored driver session
    const storedDriver = localStorage.getItem("uride_driver");
    if (storedDriver) {
      try {
        const driverSession = JSON.parse(storedDriver);
        setUser({
          uid: driverSession.uid || driverSession.id,
          email: driverSession.email,
          ...driverSession,
        });
        setLoading(false);
        return;
      } catch (error) {
        console.error("Error parsing stored driver session:", error);
      }
    }

    // If no stored session, listen to Firebase auth
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser: User | null) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            ...firebaseUser,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return { user, loading };
}
