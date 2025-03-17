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
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Send the Firebase user info to our backend
    await apiRequest("POST", "/api/google-auth", {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
    });
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
}