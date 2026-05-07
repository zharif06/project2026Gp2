"use client";

import { Eye, EyeOff, Mail, Lock, LogIn, ArrowRight, Key, X, Send, Loader2, Utensils } from "lucide-react";
import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { getUserRole } from "@/lib/roleManager";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  // Forgot Password States
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState({ type: "", text: "" });
  const [resetLoading, setResetLoading] = useState(false);
  
  const router = useRouter();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const redirectBasedOnRole = async (userId: string) => {
    const role = await getUserRole(userId);
    
    if (role === "admin") {
      router.push("/admin_page");
    } else if (role === "staff") {
      router.push("/staff_page");
    } else {
      router.push("/user_page");
    }
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        lastLogin: new Date().toISOString()
      }, { merge: true });
      
      await redirectBasedOnRole(user.uid);
    } catch (err: any) {
      console.error(err);
      let errorMessage = "Login failed";
      if (err.code === "auth/user-not-found") {
        errorMessage = "No account found with this email";
      } else if (err.code === "auth/wrong-password") {
        errorMessage = "Incorrect password";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email format";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later";
      }
      setErrors({ ...errors, email: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          role: "user",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });
      } else {
        await updateDoc(doc(db, "users", user.uid), {
          lastLogin: new Date().toISOString()
        });
      }
      
      await redirectBasedOnRole(user.uid);
    } catch (error: any) {
      console.error("Google login error:", error);
      
      if (error.code === "auth/popup-blocked") {
        alert("⚠️ Popup blocked! Please allow popups for this website and try again.");
      } else if (error.code === "auth/unauthorized-domain") {
        alert("⚠️ This domain is not authorized for Google login. Please contact administrator.");
      } else {
        alert(`Google login failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // VERSION 2: Check Firestore first - Only registered users get email
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      setResetMessage({ type: "error", text: "Please enter your email address" });
      return;
    }
    
    setResetLoading(true);
    
    try {
      // Check if email exists in Firestore users collection
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", resetEmail.toLowerCase()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setResetMessage({ 
          type: "error", 
          text: "❌ No account found with this email address. Please register first." 
        });
        setResetLoading(false);
        return;
      }
      
      // Email exists, send reset email
      await sendPasswordResetEmail(auth, resetEmail);
      
      setResetMessage({ 
        type: "success", 
        text: "✅ Password reset email sent! Check your inbox (including spam folder)." 
      });
      setResetEmail("");
      
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetMessage({ type: "", text: "" });
      }, 3000);
      
    } catch (error: any) {
      console.error("Reset password error:", error);
      setResetMessage({ 
        type: "error", 
        text: `❌ Error: ${error.message}` 
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 space-y-6 transform transition-all duration-500 hover:scale-[1.02]">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg mb-4">
              <Utensils className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-gray-500">Sign in to continue your culinary journey</p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({ ...errors, email: undefined });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLogin();
                  }}
                  className={`w-full px-4 py-3 pl-10 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white ${
                    errors.email ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({ ...errors, password: undefined });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLogin();
                  }}
                  className={`w-full px-4 py-3 pl-10 pr-12 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white ${
                    errors.password ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-orange-600 hover:text-orange-700 hover:underline transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/90 text-gray-500">or</span>
              </div>
            </div>

            {/* Google Sign In */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </button>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <a
              href="/register_page"
              className="text-orange-600 hover:text-orange-700 font-semibold hover:underline transition-colors"
            >
              Create account
            </a>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-xl">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Reset Password</h3>
              </div>
              <button 
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetMessage({ type: "", text: "" });
                }} 
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            <form onSubmit={handleForgotPassword}>
              {resetMessage.text && (
                <div className={`mb-4 p-3 rounded-lg ${resetMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {resetMessage.text}
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={resetLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-lg hover:shadow-lg disabled:opacity-50 font-semibold transition-all flex items-center justify-center gap-2"
              >
                {resetLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Checking...</>
                ) : (
                  <><Send className="w-4 h-4" /> Send Reset Link</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        `}
      </style>
    </div>
  );
}
