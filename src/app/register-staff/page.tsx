"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { setUserRole } from "@/lib/roleManager";
import { useRouter } from "next/navigation";

export default function RegisterStaff() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await setUserRole(userCred.user.uid, email, "staff");
      setMessage("✅ Staff created! Please login again as admin.");
      
      // Clear form
      setEmail("");
      setPassword("");
      
      // After 3 seconds, redirect to login
      setTimeout(() => {
        router.push("/login_page");
      }, 3000);
      
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Create Staff Account</h1>
        <p className="text-gray-500 mb-4">Only admins should access this page</p>
        
        {message && (
          <div className={`mb-4 p-3 rounded-lg ${message.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleCreateStaff}>
          <input
            type="email"
            placeholder="Staff Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg mb-3"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg mb-3"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
          >
            {loading ? "Creating..." : "Create Staff"}
          </button>
        </form>
      </div>
    </div>
  );
}