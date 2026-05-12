"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Plus, Trash2, Search, ArrowUpDown, ExternalLink } from "lucide-react";

interface UsersManagementProps {
  users: any[];
  currentUser: any;
  onRefresh: () => void;
}

export default function UsersManagement({ users, currentUser, onRefresh }: UsersManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "role">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      setMessage({ type: "success", text: `✅ Role updated to ${newRole.toUpperCase()}` });
      onRefresh();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: `❌ Failed: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`⚠️ Delete ${userEmail}? This cannot be undone.`)) return;
    if (userId === currentUser?.uid) {
      setMessage({ type: "error", text: "❌ You cannot delete yourself!" });
      return;
    }
    setLoading(true);
    try {
      await deleteDoc(doc(db, "users", userId));
      setMessage({ type: "success", text: `✅ Deleted ${userEmail}` });
      onRefresh();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: `❌ Failed: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user: any) =>
    user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === "date") {
      const dateA = new Date(a.createdAt || a.lastLogin || 0).getTime();
      const dateB = new Date(b.createdAt || b.lastLogin || 0).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    } else {
      const roleOrder = { admin: 1, staff: 2, user: 3 };
      const roleA = roleOrder[a.role as keyof typeof roleOrder] || 4;
      const roleB = roleOrder[b.role as keyof typeof roleOrder] || 4;
      return sortOrder === "asc" ? roleA - roleB : roleB - roleA;
    }
  });

  const getRoleBadge = (role: string) => {
    const safeRole = role || "user";
    const styles: Record<string, string> = {
      admin: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
      staff: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
      user: "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
    };
    const icons: Record<string, string> = {
      admin: "👑",
      staff: "⭐",
      user: "👤"
    };
    return (
      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${styles[safeRole] || styles.user}`}>
        {icons[safeRole] || "👤"} {safeRole.charAt(0).toUpperCase() + safeRole.slice(1)}
      </span>
    );
  };

  const openFirebaseConsole = () => {
    window.open("https://console.firebase.google.com/project/makanbajet-e288a/overview", "_blank");
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Manage users, assign roles, and control access</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setShowInstructions(true)} 
            className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" /> How to Add Staff
          </button>
          <button 
            onClick={openFirebaseConsole}
            className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all text-sm sm:text-base"
          >
            <ExternalLink className="w-4 h-4" /> Open Firebase Console
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message.text}
        </div>
      )}

      {/* Search and Sort Bar - Mobile Responsive */}
      <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white text-sm sm:text-base"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                if (sortBy === "date") {
                  setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                } else {
                  setSortBy("date");
                  setSortOrder("desc");
                }
              }}
              className={`flex-1 sm:flex-initial px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                sortBy === "date" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Date Joined <ArrowUpDown className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                if (sortBy === "role") {
                  setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                } else {
                  setSortBy("role");
                  setSortOrder("asc");
                }
              }}
              className={`flex-1 sm:flex-initial px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                sortBy === "role" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Role <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Users Table - Horizontal Scroll on Mobile */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-orange-50 to-red-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase">User</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase">Role</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase">Joined</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 sm:px-6 py-8 sm:py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                sortedUsers.map((userItem: any) => (
                  <tr key={userItem.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-900 break-all">{userItem.email}</p>
                        <p className="text-xs text-gray-500">ID: {userItem.id?.slice(0, 8)}...</p>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        {getRoleBadge(userItem.role)}
                        <select
                          value={userItem.role || "user"}
                          onChange={(e) => handleUpdateRole(userItem.id, e.target.value)}
                          className="text-xs sm:text-sm border border-gray-300 rounded-lg px-2 py-1 bg-white text-gray-700"
                          disabled={loading || userItem.id === currentUser?.uid}
                        >
                          <option value="user">Change to User</option>
                          <option value="staff">Change to Staff</option>
                          <option value="admin">Change to Admin</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">
                      {userItem.createdAt ? new Date(userItem.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <button
                        onClick={() => handleDeleteUser(userItem.id, userItem.email)}
                        disabled={loading || userItem.id === currentUser?.uid}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instructions Modal - Mobile Responsive */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">How to Add Staff Member</h3>
              <button 
                onClick={() => setShowInstructions(false)} 
                className="p-1 hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px]"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">⚡ Quick Method: Use Firebase Console</p>
                <p className="text-sm text-blue-700 mt-1">Click the "Open Firebase Console" button above.</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="bg-orange-500 text-white w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">1</span>
                  <div>
                    <p className="font-medium text-sm sm:text-base">Go to Firebase Console</p>
                    <p className="text-xs sm:text-sm text-gray-500">Click the "Open Firebase Console" button</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="bg-orange-500 text-white w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">2</span>
                  <div>
                    <p className="font-medium text-sm sm:text-base">Go to Authentication → Users</p>
                    <p className="text-xs sm:text-sm text-gray-500">Click "Add user" and enter email and password</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="bg-orange-500 text-white w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">3</span>
                  <div>
                    <p className="font-medium text-sm sm:text-base">Copy the User UID</p>
                    <p className="text-xs sm:text-sm text-gray-500">After creating, copy the long User UID string</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="bg-orange-500 text-white w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">4</span>
                  <div>
                    <p className="font-medium text-sm sm:text-base">Go to Firestore → users collection</p>
                    <p className="text-xs sm:text-sm text-gray-500">Click "Add document"</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="bg-orange-500 text-white w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">5</span>
                  <div>
                    <p className="font-medium text-sm sm:text-base">Set Document ID as the User UID</p>
                    <p className="text-xs sm:text-sm text-gray-500">Paste the UID as the document ID</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="bg-orange-500 text-white w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">6</span>
                  <div>
                    <p className="font-medium text-sm sm:text-base">Add the following fields:</p>
                    <div className="bg-gray-100 p-2 sm:p-3 rounded-lg mt-2 text-xs sm:text-sm font-mono overflow-x-auto">
                      email: "staff@example.com"<br />
                      name: "Staff Name"<br />
                      role: "staff"<br />
                      createdAt: new Date().toISOString()
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="bg-orange-500 text-white w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">7</span>
                  <div>
                    <p className="font-medium text-sm sm:text-base">Click Save</p>
                    <p className="text-xs sm:text-sm text-gray-500">The staff member will appear in the list above</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 sm:mt-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-xs sm:text-sm text-yellow-800">💡 Tip: Open Firebase Console in a new tab so you can follow these steps while keeping your admin panel open.</p>
              </div>
              
              <button
                onClick={() => setShowInstructions(false)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm sm:text-base mt-2"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}