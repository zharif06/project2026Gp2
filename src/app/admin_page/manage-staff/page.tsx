"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import { Trash2, UserPlus, Mail, Shield } from "lucide-react";

export default function ManageStaffPage() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const q = query(collection(db, "users"), where("role", "==", "staff"));
      const snapshot = await getDocs(q);
      const staff: any[] = [];
      snapshot.forEach((doc) => {
        staff.push({ id: doc.id, ...doc.data() });
      });
      setStaffList(staff);
    } catch (error) {
      console.error("Error fetching staff:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (confirm(`Delete ${email}?`)) {
      try {
        await deleteDoc(doc(db, "users", id));
        await fetchStaff();
        alert("Staff deleted!");
      } catch (error) {
        alert("Error deleting staff");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Staff Management</h1>
              <p className="text-gray-500">Manage staff members</p>
            </div>
            <a
              href="https://console.firebase.google.com/u/0/project/makanbajet-e288a/authentication/users"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <UserPlus className="w-4 h-4" />
              Add Staff in Firebase Console
            </a>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{staff.email}</td>
                    <td className="px-4 py-3 text-sm">{staff.name || "-"}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        Staff
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(staff.id, staff.email)}
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

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              To add a new staff member:
            </p>
            <ol className="mt-2 text-sm text-blue-700 list-decimal list-inside space-y-1">
              <li>Click "Add Staff in Firebase Console" button above</li>
              <li>Go to Authentication → Users → Add user</li>
              <li>Create user with email and password</li>
              <li>Copy the User UID</li>
              <li>Go to Firestore → users collection → Add document</li>
              <li>Set Document ID as the User UID</li>
              <li>Add field <code className="bg-blue-100 px-1 rounded">role: "staff"</code></li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}