// lib/roleManager.ts
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export type UserRole = "admin" | "staff" | "user";

export const setUserRole = async (userId: string, email: string, role: UserRole) => {
  try {
    await setDoc(doc(db, "users", userId), {
      email: email,
      role: role,
      createdAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error setting user role:", error);
    return false;
  }
};

export const getUserRole = async (userId: string): Promise<UserRole | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return data.role as UserRole;
    }
    return "user";
  } catch (error) {
    console.error("Error getting user role:", error);
    return "user";
  }
};