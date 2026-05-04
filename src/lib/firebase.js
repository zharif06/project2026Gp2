// lib/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAmH_FoMklW9sz47ORc4I79O6ebV_Wmneo",
  authDomain: "makanbajet-e288a.firebaseapp.com",
  projectId: "makanbajet-e288a",
  storageBucket: "makanbajet-e288a.firebasestorage.app",
  messagingSenderId: "982742071428",
  appId: "1:982742071428:web:aa9cef9af61eff0a7aaad1",
  measurementId: "G-DVC1Y6QDQB"
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

if (typeof window !== "undefined") {
  isSupported().then((yes) => {
    if (yes) {
      getAnalytics(app);
    }
  });
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;