"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { Save, ArrowLeft, Eye, EyeOff, Lock, Upload } from "lucide-react";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { PageType } from "../page";

interface EditProfileProps {
  user: any;
  setCurrentPage: (page: PageType) => void;
}

export default function EditProfile({ user, setCurrentPage }: EditProfileProps) {
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Password change states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage("⚠️ Image must be less than 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      const url = await uploadToCloudinary(file);
      setPhotoURL(url);
      setMessage("✅ Image uploaded! Click Save to update profile.");
    } catch (error) {
      setMessage("❌ Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await updateProfile(auth.currentUser!, {
        displayName: displayName,
        photoURL: photoURL,
      });

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        displayName: displayName,
        photoURL: photoURL,
        updatedAt: new Date().toISOString()
      });

      setMessage("✅ Profile updated successfully!");
      setTimeout(() => setCurrentPage("profile"), 2000);
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setPasswordMessage("❌ New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage("❌ Password must be at least 6 characters");
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage("");

    try {
      const userCred = auth.currentUser!;
      const credential = EmailAuthProvider.credential(userCred.email!, currentPassword);
      await reauthenticateWithCredential(userCred, credential);
      await updatePassword(userCred, newPassword);
      
      setPasswordMessage("✅ Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
      
      setTimeout(() => setPasswordMessage(""), 3000);
    } catch (error: any) {
      if (error.code === "auth/wrong-password") {
        setPasswordMessage("❌ Current password is incorrect");
      } else if (error.code === "auth/too-many-requests") {
        setPasswordMessage("❌ Too many failed attempts. Please try again later");
      } else {
        setPasswordMessage(`❌ Error: ${error.message}`);
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="text-gray-900">
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <button
          onClick={() => setCurrentPage("profile")}
          className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-900 transition-colors min-h-[44px] text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Profile</h1>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100">
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400 text-sm sm:text-base"
              placeholder="Enter your display name"
            />
            <p className="text-xs text-gray-500 mt-1">This name will appear on your reviews</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Photo
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              {photoURL && (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-blue-500 flex-shrink-0">
                  <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                </div>
              )}
              <label className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 cursor-pointer text-sm sm:text-base">
                <Upload className="w-4 h-4" />
                {uploadingImage ? "Uploading..." : "Upload Image"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <input
                type="url"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                className="flex-1 w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400 text-sm sm:text-base"
                placeholder="Or paste image URL"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Upload an image or paste a URL for your profile picture</p>
          </div>

          {photoURL && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gray-200">
                <img src={photoURL} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <span className="text-xs sm:text-sm text-gray-600">Profile photo preview</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold text-sm sm:text-base"
            >
              <Save className="w-4 h-4" />
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage("profile")}
              className="px-4 sm:px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold text-sm sm:text-base"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Change Password Section */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Change Password</h3>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {showPasswordForm ? "Cancel" : "Change Password"}
            </button>
          </div>

          {passwordMessage && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${passwordMessage.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {passwordMessage}
            </div>
          )}

          {showPasswordForm && (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white text-sm sm:text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white text-sm sm:text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white text-sm sm:text-base"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold text-sm sm:text-base"
              >
                <Lock className="w-4 h-4" />
                {passwordLoading ? "Changing..." : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
