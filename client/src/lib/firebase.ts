import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { apiRequest, queryClient } from "./queryClient";

const firebaseConfig = {
  apiKey: "AIzaSyASgrScK8oqNjPC5tquqdF3BRWm0pWX6fA",
  authDomain: "stree-f8587.firebaseapp.com",
  projectId: "stree-f8587",
  storageBucket: "stree-f8587.firebasestorage.app",
  messagingSenderId: "799376222576",
  appId: "1:799376222576:web:dac579d1635421f5e2c7b5",
  measurementId: "G-VS6QPTZ9Q1"
};

// Initialize Firebase (only once)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
console.log("Firebase app initialized with config:", {
  ...firebaseConfig,
  apiKey: "****" // Hide API key in logs
});

export const auth = getAuth(app);
console.log("Firebase auth initialized:", auth.currentUser);

// Initialize Analytics (only in production environment)
try {
  if (typeof window !== 'undefined') {
    getAnalytics(app);
    console.log("Firebase Analytics initialized");
  }
} catch (error) {
  console.log("Analytics initialization skipped:", error);
}

export async function signInWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });

  try {
    console.log("Starting Google sign-in process...");
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("Google sign-in successful:", user.email);

    // Send the Firebase user info to our backend
    console.log("Sending user info to backend...");
    const response = await apiRequest("POST", "/api/google-auth", {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Backend authentication failed: ${error}`);
    }

    // Invalidate and refetch user data after successful login
    await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    console.log("Backend authentication successful");
  } catch (error) {
    console.error("Error during Google sign-in:", error);
    if (error instanceof Error) {
      if (error.message.includes('auth/configuration-not-found')) {
        throw new Error("Firebase is not properly configured. Please make sure Google sign-in is enabled in Firebase Console and the domain is authorized.");
      } else if (error.message.includes('popup')) {
        throw new Error("Popup was blocked. Please allow popups for this site.");
      } else if (error.message.includes('network')) {
        throw new Error("Network error. Please check your connection.");
      }
    }
    throw error;
  }
}