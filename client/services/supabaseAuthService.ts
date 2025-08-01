import { supabase } from "@/supabase/config";
import type { AuthError, User, Session } from "@supabase/supabase-js";

export interface SupabaseAuthResult {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

export class SupabaseAuthService {
  // Sign up with email and password
  async signUpWithEmailAndPassword(
    email: string,
    password: string,
  ): Promise<SupabaseAuthResult> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    return {
      user: data.user,
      session: data.session,
      error: error as AuthError | null,
    };
  }

  // Sign in with email and password
  async signInWithEmailAndPassword(
    email: string,
    password: string,
  ): Promise<SupabaseAuthResult> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return {
      user: data.user,
      session: data.session,
      error: error as AuthError | null,
    };
  }

  // Sign out
  async signOut(): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signOut();
    return { error: error as AuthError | null };
  }

  // Get current user
  getCurrentUser(): User | null {
    const {
      data: { user },
    } = supabase.auth.getUser();
    return user;
  }

  // Get current session
  async getCurrentSession(): Promise<Session | null> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  }

  // Listen to auth state changes
  onAuthStateChange(
    callback: (event: string, session: Session | null) => void,
  ) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // Reset password
  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error: error as AuthError | null };
  }

  // Update user profile
  async updateProfile(updates: {
    email?: string;
    password?: string;
  }): Promise<SupabaseAuthResult> {
    const { data, error } = await supabase.auth.updateUser(updates);

    return {
      user: data.user,
      session: null,
      error: error as AuthError | null,
    };
  }
}

// Export singleton instance
export const supabaseAuthService = new SupabaseAuthService();
