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
      <div className="px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center py-2 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 lg:hidden min-h-[44px] min-w-[44px]"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-1.5 sm:p-2 rounded-xl">
                <Utensils className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Staff Panel
                </h1>
                <p className="text-xs text-gray-500">Restaurant Management System</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-gray-100 relative transition-colors min-h-[44px] min-w-[44px]"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
                  <div className="p-3 border-b bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-xl">
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">Notifications</p>
                  </div>
                  <div className="p-3 sm:p-4 text-center text-gray-500 text-xs sm:text-sm">
                    No new notifications
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 sm:gap-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <div className="w-7 h-7 sm:w-9 sm:h-9 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs sm:text-sm font-semibold text-gray-800">
                    {user?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-500">Staff Member</p>
                </div>
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 hidden md:block" />
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
                  <div className="p-1 sm:p-2">
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-xs sm:text-sm"
                    >
                      <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
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