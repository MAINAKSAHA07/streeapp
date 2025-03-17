import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";
import { apiRequest } from "./queryClient";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}` 
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

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