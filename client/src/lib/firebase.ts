import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { apiRequest } from "./queryClient";

const firebaseConfig = {
  apiKey: "AIzaSyASgrScK8oqNjPC5tquqdF3BRWm0pWX6fA",
  authDomain: "stree-f8587.firebaseapp.com",
  projectId: "stree-f8587",
  storageBucket: "stree-f8587.firebasestorage.app",
  messagingSenderId: "799376222576",
  appId: "1:799376222576:web:dac579d1635421f5e2c7b5",
  measurementId: "G-VS6QPTZ9Q1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Analytics (only in production environment)
try {
  getAnalytics(app);
} catch (error) {
  console.log("Analytics initialization skipped in development");
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

    console.log("Backend authentication successful");
  } catch (error) {
    console.error("Error during Google sign-in:", error);
    if (error instanceof Error) {
      if (error.message.includes('popup')) {
        throw new Error("Popup was blocked. Please allow popups for this site.");
      } else if (error.message.includes('network')) {
        throw new Error("Network error. Please check your connection.");
      }
    }
    throw error;
  }
}