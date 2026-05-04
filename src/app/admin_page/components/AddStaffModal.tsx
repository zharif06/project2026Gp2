// src/app/admin_page/components/AddStaffModal.tsx
"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { X, Loader2, Mail, Lock, UserPlus, CheckCircle } from "lucide-react";

interface AddStaffModalProps {
  onClose: () => void;
  onRefresh: () => void;
  adminEmail: string;
}

export default function AddStaffModal({ onClose, onRefresh, adminEmail }: AddStaffModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setMessage({ type: "error", text: "Please fill in all fields" });
      return;
    }
    
    if (password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }
    
    setLoading(true);
    setMessage({ type: "", text: "" });
    
    // Get admin password from session storage or prompt
    let adminPassword = sessionStorage.getItem("adminPwd");
    if (!adminPassword) {
      adminPassword = prompt("Please enter your admin password to continue:");
      if (adminPassword) {
        sessionStorage.setItem("adminPwd", adminPassword);
      } else {
        setMessage({ type: "error", text: "Admin password required" });
        setLoading(false);
        return;
      }
    }
    
    try {
      // Create staff user (this will log out admin)
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      
      // Set role in Firestore
      await setDoc(doc(db, "users", userCred.user.uid), {
        email: email,
        name: name || email.split('@')[0],
        role: "staff",
        createdAt: new Date().toISOString()
      });
      
      // Log back in as admin
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      
      setMessage({ type: "success", text: "✅ Staff created successfully!" });
      
      // Clear form
      setEmail("");
      setPassword("");
      setName("");
      
      // Refresh user list
      await onRefresh();
      
      // Close modal after delay
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error: any) {
      console.error("Error:", error);
      if (error.code === "auth/email-already-in-use") {
        setMessage({ type: "error", text: "❌ Email already exists!" });
      } else if (error.code === "auth/wrong-password") {
        setMessage({ type: "error", text: "❌ Wrong admin password!" });
        sessionStorage.removeItem("adminPwd");
      } else {
        setMessage({ type: "error", text: `❌ ${error.message}` });
      }
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-xl">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Add New Staff Member</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {message.text && (
              <div className={`p-3 rounded-lg flex items-center gap-2 ${
                message.type === "success" 
                  ? "bg-green-100 text-green-700 border-l-4 border-green-500" 
                  : "bg-red-100 text-red-700 border-l-4 border-red-500"
              }`}>
                {message.type === "success" && <CheckCircle className="w-4 h-4" />}
                {message.text}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name (Optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
                placeholder="Staff Name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
                  placeholder="staff@example.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
                  placeholder="••••••••"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 rounded-lg hover:shadow-lg disabled:opacity-50 font-semibold transition-all flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><UserPlus className="w-4 h-4" /> Create Staff Account</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}