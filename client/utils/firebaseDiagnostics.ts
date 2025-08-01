import { auth } from "@/firebase/config";
import { connectAuthEmulator, signInAnonymously, signOut } from "firebase/auth";

export interface FirebaseDiagnostic {
  status: 'success' | 'error' | 'warning';
  message: string;
  code?: string;
  details?: string;
}

export const runFirebaseDiagnostics = async (): Promise<FirebaseDiagnostic[]> => {
  const diagnostics: FirebaseDiagnostic[] = [];

  // Check Firebase configuration
  try {
    const config = auth.app.options;
    
    if (!config.apiKey) {
      diagnostics.push({
        status: 'error',
        message: 'Firebase API Key is missing',
        details: 'Check your Firebase configuration'
      });
    } else {
      diagnostics.push({
        status: 'success',
        message: 'Firebase API Key is configured',
        details: `Key: ${config.apiKey.substring(0, 10)}...`
      });
    }

    if (!config.projectId) {
      diagnostics.push({
        status: 'error',
        message: 'Firebase Project ID is missing',
        details: 'Check your Firebase configuration'
      });
    } else {
      diagnostics.push({
        status: 'success',
        message: 'Firebase Project ID is configured',
        details: `Project: ${config.projectId}`
      });
    }

    if (!config.authDomain) {
      diagnostics.push({
        status: 'error',
        message: 'Firebase Auth Domain is missing',
        details: 'Check your Firebase configuration'
      });
    } else {
      diagnostics.push({
        status: 'success',
        message: 'Firebase Auth Domain is configured',
        details: `Domain: ${config.authDomain}`
      });
    }
    
  } catch (error: any) {
    diagnostics.push({
      status: 'error',
      message: 'Firebase configuration error',
      code: error.code,
      details: error.message
    });
  }

  // Test Firebase Authentication connectivity
  try {
    // Test if we can connect to Firebase Auth
    const userCredential = await signInAnonymously(auth);
    await signOut(auth);
    
    diagnostics.push({
      status: 'success',
      message: 'Firebase Authentication is working',
      details: 'Successfully connected to Firebase Auth service'
    });
    
  } catch (error: any) {
    let message = 'Firebase Authentication failed';
    let details = error.message;
    
    if (error.code === 'auth/configuration-not-found') {
      message = 'Firebase project configuration not found';
      details = 'The Firebase project may not exist or Authentication may not be enabled. Please check your Firebase Console.';
    } else if (error.code === 'auth/api-key-not-valid') {
      message = 'Invalid Firebase API key';
      details = 'The API key in your configuration is invalid or has been revoked.';
    } else if (error.code === 'auth/network-request-failed') {
      message = 'Network connectivity issue';
      details = 'Cannot reach Firebase servers. Check your internet connection.';
    } else if (error.code === 'auth/app-not-authorized') {
      message = 'App not authorized';
      details = 'This app is not authorized to use Firebase Authentication. Check your Firebase Console settings.';
    }
    
    diagnostics.push({
      status: 'error',
      message,
      code: error.code,
      details
    });
  }

  return diagnostics;
};

export const printFirebaseDiagnostics = async (): Promise<void> => {
  console.log('🔍 Running Firebase Diagnostics...');
  const diagnostics = await runFirebaseDiagnostics();
  
  diagnostics.forEach(diag => {
    const icon = diag.status === 'success' ? '✅' : diag.status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${diag.message}`);
    if (diag.details) {
      console.log(`   ${diag.details}`);
    }
    if (diag.code) {
      console.log(`   Error Code: ${diag.code}`);
    }
  });
  
  const hasErrors = diagnostics.some(d => d.status === 'error');
  if (hasErrors) {
    console.log('\n🛠️ Possible Solutions:');
    console.log('1. Check that your Firebase project exists in Firebase Console');
    console.log('2. Ensure Firebase Authentication is enabled in your project');
    console.log('3. Verify your API key is correct and not restricted');
    console.log('4. Check your internet connection');
    console.log('5. Review Firebase Console for any project restrictions');
  }
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).firebaseDiagnostics = printFirebaseDiagnostics;
}
