"use client";

import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithPopup
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";
import { setUserRole } from "@/lib/roleManager";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string; terms?: string }>({});
  const router = useRouter();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; confirm?: string; terms?: string } = {};
    
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
    
    if (!confirmPassword) {
      newErrors.confirm = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirm = "Passwords do not match";
    }
    
    if (!acceptTerms) {
      newErrors.terms = "You must agree to the Terms of Service and Privacy Policy";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Save user role to Firestore (default to "user")
      await setUserRole(user.uid, email, "user");
      
      // Redirect to dashboard (all new users are regular users)
      router.push("/login_page");
    } catch (err: any) {
      console.error(err);
      let errorMessage = "Registration failed";
      if (err.code === "auth/email-already-in-use") {
        errorMessage = "Email already in use";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "Password is too weak";
      }
      setErrors({ ...errors, email: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;
      
      // Save user role to Firestore (default to "user")
      await setUserRole(user.uid, user.email!, "user");
      
      // Redirect to dashboard
      router.push("/login_page");
    } catch (err) {
      console.error(err);
      alert("Google sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 space-y-6 transform transition-all duration-500 hover:scale-[1.02]">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Create Account
            </h1>
            <p className="text-gray-500">Join us and start your journey</p>
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
                  className={`w-full px-4 py-3 pl-10 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                    errors.email ? "border-red-500 bg-red-50" : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 animate-fadeIn">{errors.email}</p>
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
                  className={`w-full px-4 py-3 pl-10 pr-12 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                    errors.password ? "border-red-500 bg-red-50" : "border-gray-200 bg-white hover:border-gray-300"
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
                <p className="text-sm text-red-500 animate-fadeIn">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors({ ...errors, confirm: undefined });
                  }}
                  className={`w-full px-4 py-3 pl-10 pr-12 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                    errors.confirm ? "border-red-500 bg-red-50" : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirm && (
                <p className="text-sm text-red-500 animate-fadeIn">{errors.confirm}</p>
              )}
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="space-y-1">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptTerms}
                  onChange={(e) => {
                    setAcceptTerms(e.target.checked);
                    setErrors({ ...errors, terms: undefined });
                  }}
                  className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="acceptTerms" className="text-sm text-gray-600">
                  I agree to the{" "}
                  <a href="/register_page/terms-of-service" target="_blank" className="text-blue-600 hover:text-blue-700 hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/register_page/privacy-policy" target="_blank" className="text-blue-600 hover:text-blue-700 hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>
              {errors.terms && (
                <p className="text-sm text-red-500 animate-fadeIn">{errors.terms}</p>
              )}
            </div>

            {/* Register Button */}
            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Create Account
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
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Google Sign Up */}
            <button
              onClick={handleGoogleRegister}
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
              Sign up with Google
            </button>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <a
              href="/login_page"
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
            >
              Sign in
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}