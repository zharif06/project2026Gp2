"use client";

import { Utensils, LogOut, Bell, Menu, User, ChevronDown } from "lucide-react";
import { useState } from "react";

interface StaffHeaderProps {
  user: any;
  onLogout: () => void;
  onToggleSidebar: () => void;
}

export default function StaffHeader({ user, onLogout, onToggleSidebar }: StaffHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-xl">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Staff Panel
                </h1>
                <p className="text-xs text-gray-500">Restaurant Management System</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-gray-100 relative transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
                  <div className="p-3 border-b bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-xl">
                    <p className="font-semibold text-gray-800">Notifications</p>
                  </div>
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No new notifications
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-800">
                    {user?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-500">Staff Member</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
                  <div className="p-2">
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}