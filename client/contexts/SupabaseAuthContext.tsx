import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabaseAuthService } from "@/services/supabaseAuthService";
import type { User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: SignupData) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

const SupabaseAuthContext = createContext<AuthContextType | undefined>(undefined);

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error("useSupabaseAuth must be used within a SupabaseAuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const SupabaseAuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Transform Supabase user to our AuthUser format
  const transformUser = (supabaseUser: User | null): AuthUser | null => {
    if (!supabaseUser) return null;
    
    return {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
      email: supabaseUser.email || '',
      phone: supabaseUser.user_metadata?.phone,
    };
  };

  // Check for existing session on app load
  useEffect(() => {
    // Get initial session
    supabaseAuthService.getCurrentSession().then((session) => {
      setSession(session);
      setUser(transformUser(session?.user || null));
      setIsLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabaseAuthService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(transformUser(session?.user || null));
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { user: supabaseUser, session, error } = await supabaseAuthService.signInWithEmailAndPassword(email, password);
      
      if (error) {
        console.error("Login error:", error.message);
        setIsLoading(false);
        return false;
      }

      if (supabaseUser && session) {
        setSession(session);
        setUser(transformUser(supabaseUser));
        setIsLoading(false);
        return true;
      } else {
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (userData: SignupData): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { user: supabaseUser, session, error } = await supabaseAuthService.signUpWithEmailAndPassword(
        userData.email, 
        userData.password
      );
      
      if (error) {
        console.error("Signup error:", error.message);
        setIsLoading(false);
        return false;
      }

      if (supabaseUser) {
        // Update user metadata with name and phone
        await supabaseAuthService.updateProfile({
          email: userData.email,
        });

        // Note: For user metadata like name and phone, you might want to store them in a separate profiles table
        // This is a common pattern in Supabase applications
        
        if (session) {
          setSession(session);
          setUser(transformUser(supabaseUser));
        }
        
        setIsLoading(false);
        return true;
      } else {
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Signup error:", error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const { error } = await supabaseAuthService.signOut();
      if (error) {
        console.error("Logout error:", error.message);
      }
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    login,
    signup,
    logout,
    isLoading,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

// For backward compatibility, also export as useAuth
export const useAuth = useSupabaseAuth;
export const AuthProvider = SupabaseAuthProvider;
