"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Plus, Trash2, Search, ExternalLink, ChevronDown } from "lucide-react";

interface UsersManagementProps {
  users: any[];
  currentUser: any;
  onRefresh: () => void;
}

export default function UsersManagement({ users, currentUser, onRefresh }: UsersManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
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

  const getRoleBadge = (role: string) => {
    const safeRole = role || "user";
    const styles: Record<string, string> = {
      admin: "bg-purple-100 text-purple-700",
      staff: "bg-blue-100 text-blue-700",
      user: "bg-gray-100 text-gray-700"
    };
    const icons: Record<string, string> = {
      admin: "👑",
      staff: "⭐",
      user: "👤"
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[safeRole]}`}>
        {icons[safeRole]} {safeRole}
      </span>
    );
  };

  const openFirebaseConsole = () => {
    window.open("https://console.firebase.google.com/project/makanbajet-e288a/overview", "_blank");
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-sm text-gray-500">Manage users, assign roles, and control access</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setShowInstructions(true)} 
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm"
          >
            <Plus className="w-4 h-4" /> How to Add Staff
          </button>
          <button 
            onClick={openFirebaseConsole}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-sm"
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

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white text-sm"
          />
        </div>
      </div>

      {/* Users List - CARD VIEW for mobile, TABLE for desktop */}
      <div className="space-y-3">
        {/* Desktop view - hidden on mobile */}
        <div className="hidden md:block bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-orange-50">
                <tr>
                  <th className="p-3 text-left text-gray-700">User</th>
                  <th className="p-3 text-left text-gray-700">Role</th>
                  <th className="p-3 text-left text-gray-700">Joined</th>
                  <th className="p-3 text-left text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user: any) => (
                  <tr key={user.id} className="border-t">
                    <td className="p-3">
                      <div className="max-w-[200px]">
                        <p className="font-medium text-gray-800 break-words">{user.email}</p>
                        <p className="text-xs text-gray-400">ID: {user.id?.slice(0, 8)}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getRoleBadge(user.role)}
                        <select
                          value={user.role || "user"}
                          onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                          className="text-xs border rounded px-2 py-1 bg-white text-gray-700"
                          disabled={loading}
                        >
                          <option value="user">User</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </td>
                    <td className="p-3 text-gray-500 whitespace-nowrap">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        disabled={user.id === currentUser?.uid}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile view - CARD VIEW */}
        <div className="md:hidden space-y-3">
          {filteredUsers.map((user: any) => (
            <div key={user.id} className="bg-white rounded-xl shadow p-4 border border-gray-100">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 break-words">{user.email}</p>
                  <p className="text-xs text-gray-400">ID: {user.id?.slice(0, 8)}...</p>
                </div>
                <button
                  onClick={() => handleDeleteUser(user.id, user.email)}
                  disabled={user.id === currentUser?.uid}
                  className="text-red-500 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                <div>
                  {getRoleBadge(user.role)}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    📅 {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                  </span>
                  <select
                    value={user.role || "user"}
                    onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                    className="text-xs border rounded-lg px-2 py-1 bg-white text-gray-700"
                    disabled={loading}
                  >
                    <option value="user">👤 User</option>
                    <option value="staff">⭐ Staff</option>
                    <option value="admin">👑 Admin</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-10 text-gray-500">No users found</div>
      )}

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">How to Add Staff</h3>
              <button onClick={() => setShowInstructions(false)} className="text-gray-500 text-xl">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-800">Click <strong>"Open Firebase Console"</strong> button</p>
              </div>
              <div className="space-y-2">
                <p>1️⃣ Go to Authentication → Users → Add user</p>
                <p>2️⃣ Enter email & password, click Add user</p>
                <p>3️⃣ Copy the User UID</p>
                <p>4️⃣ Go to Firestore → users collection → Add document</p>
                <p>5️⃣ Set Document ID as the User UID</p>
                <p>6️⃣ Add fields: email, role: "staff", createdAt</p>
              </div>
              <button
                onClick={() => setShowInstructions(false)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg mt-3"
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
