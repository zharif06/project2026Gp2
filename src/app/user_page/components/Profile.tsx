"use client";

import { User, Mail, Calendar, Edit2 } from "lucide-react";
import { PageType } from "../page";

interface ProfileProps {
  user: any;
  setCurrentPage: (page: PageType) => void;
}

export default function Profile({ user, setCurrentPage }: ProfileProps) {
  const displayName = user?.displayName || user?.email?.split('@')[0] || "User";
  const photoURL = user?.photoURL || null;

  return (
    <div className="text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <button
          onClick={() => setCurrentPage("editProfile")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          Edit Profile
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        {/* Profile Photo */}
        <div className="flex items-center justify-center mb-6">
          {photoURL ? (
            <img 
              src={photoURL} 
              alt={displayName}
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
            />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
          )}
        </div>

        {/* Display Name */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>

        <div className="space-y-4">
          <div className="border-b border-gray-200 pb-3">
            <label className="text-sm text-gray-500 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </label>
            <p className="text-gray-900 font-medium mt-1">{user?.email}</p>
          </div>

          <div className="border-b border-gray-200 pb-3">
            <label className="text-sm text-gray-500 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Member Since
            </label>
            <p className="text-gray-900 mt-1">{new Date(user?.metadata?.creationTime).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}