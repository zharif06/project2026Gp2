"use client";

import { LayoutDashboard, Utensils, Star } from "lucide-react";

interface StaffSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  stats: {
    totalRestaurants: number;
    pendingRestaurants: number;
    approvedRestaurants: number;
    totalReviews: number;
    averageRating: string;
  };
}

export default function StaffSidebar({ activeTab, onTabChange, isOpen, stats }: StaffSidebarProps) {
  console.log("StaffSidebar stats:", stats); // Debug log

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "blue" },
    { id: "restaurants", label: "My Restaurants", icon: Utensils, color: "cyan" },
    { id: "reviews", label: "Customer Reviews", icon: Star, color: "purple" },
  ];

  const getColorClasses = (color: string, isActive: boolean) => {
    if (!isActive) return "text-gray-600 hover:bg-gray-100";
    switch(color) {
      case "blue": return "bg-blue-100 text-blue-700 border-blue-500";
      case "cyan": return "bg-cyan-100 text-cyan-700 border-cyan-500";
      case "purple": return "bg-purple-100 text-purple-700 border-purple-500";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed left-0 top-16 w-16 bg-white shadow-lg min-h-screen z-30">
        <nav className="mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full p-3 flex justify-center transition-colors relative group ${
                  isActive ? `bg-${item.color}-50 text-${item.color}-600` : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  return (
    <aside className="fixed left-0 top-16 w-64 bg-white shadow-lg min-h-screen z-30">
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-1 rounded-lg">
            <Star className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Staff Performance</p>
            <p className="text-sm font-semibold text-gray-800">⭐ {stats.averageRating} avg rating</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-all duration-200 border-l-4 ${
                isActive 
                  ? getColorClasses(item.color, true) 
                  : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {item.id === "restaurants" && stats.totalRestaurants > 0 && (
                <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {stats.totalRestaurants}
                </span>
              )}
              {item.id === "reviews" && stats.totalReviews > 0 && (
                <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {stats.totalReviews}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}