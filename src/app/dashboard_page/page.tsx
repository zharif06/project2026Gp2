"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { getUserRole } from "@/lib/roleManager";

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const user = auth.currentUser;
      if (user) {
        const role = await getUserRole(user.uid);
        setUserRole(role);
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login_page");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {auth.currentUser?.email}</p>
              {userRole && (
                <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  Role: {userRole}
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>

          <div className="grid gap-4 mt-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="font-semibold mb-2">Your Information</h2>
              <p className="text-sm text-gray-600">Email: {auth.currentUser?.email}</p>
              <p className="text-sm text-gray-600">User ID: {auth.currentUser?.uid}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}