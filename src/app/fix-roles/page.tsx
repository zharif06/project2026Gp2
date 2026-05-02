"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function FixRoles() {
  const [status, setStatus] = useState("Checking...");
  const router = useRouter();

  useEffect(() => {
    const fixUserRole = async () => {
      const user = auth.currentUser;
      
      if (!user) {
        setStatus("Please login first!");
        setTimeout(() => router.push("/login_page"), 2000);
        return;
      }

      try {
        setStatus(`Adding role for user: ${user.email}`);
        
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          role: "user",
          createdAt: new Date().toISOString()
        }, { merge: true }); // merge: true will not overwrite existing data
        
        setStatus("✅ Role added successfully! Redirecting...");
        setTimeout(() => router.push("/user_page"), 2000);
      } catch (error) {
        console.error(error);
        setStatus("❌ Error adding role. Check console.");
      }
    };

    fixUserRole();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Fix User Role</h1>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  );
}