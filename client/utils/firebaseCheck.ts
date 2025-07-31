import { auth } from '@/firebase/config';
import { signInAnonymously, signOut } from 'firebase/auth';

let firebaseAvailable: boolean | null = null;

export const checkFirebaseConnection = async (): Promise<boolean> => {
  // Return cached result if available
  if (firebaseAvailable !== null) {
    return firebaseAvailable;
  }

  try {
    // Test Firebase connection with anonymous sign-in
    const userCredential = await signInAnonymously(auth);
    
    // Immediately sign out the anonymous user
    await signOut(auth);
    
    firebaseAvailable = true;
    console.log('✅ Firebase connection successful');
    return true;
  } catch (error: any) {
    firebaseAvailable = false;
    console.warn('❌ Firebase connection failed:', error.message);
    
    // Network request failed means Firebase is unreachable
    if (error.code === 'auth/network-request-failed') {
      console.warn('🔄 Using fallback authentication due to network issues');
    }
    
    return false;
  }
};

export const isFirebaseAvailable = (): boolean | null => {
  return firebaseAvailable;
};

// Reset the cache (useful for testing)
export const resetFirebaseCheck = (): void => {
  firebaseAvailable = null;
};
