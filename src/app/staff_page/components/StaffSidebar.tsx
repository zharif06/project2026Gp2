"use client";

import { LayoutDashboard, Utensils, Star, X } from "lucide-react";

interface StaffSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose?: () => void;
  stats: {
    totalRestaurants: number;
    totalReviews: number;
    averageRating: string;
  };
}

export default function StaffSidebar({ activeTab, onTabChange, isOpen, onClose, stats }: StaffSidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "restaurants", label: "My Restaurants", icon: Utensils },
    { id: "reviews", label: "Customer Reviews", icon: Star },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR - can be shown/hidden */}
      <aside className={`hidden lg:block fixed left-0 top-16 w-64 bg-white shadow-lg h-[calc(100vh-4rem)] overflow-y-auto z-30 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-cyan-50">
          <p className="text-xs text-gray-500">Staff Performance</p>
          <p className="text-sm font-semibold text-gray-800">⭐ {stats.averageRating} avg rating</p>
        </div>
        <nav className="mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-all duration-200 ${
                  isActive ? "bg-blue-50 text-blue-600 border-r-4 border-blue-500" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
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

      {/* MOBILE SIDEBAR */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onClose}
          />
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl z-50 overflow-y-auto lg:hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Staff Menu</h2>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-cyan-50">
              <p className="text-xs text-gray-500">Staff Performance</p>
              <p className="text-sm font-semibold text-gray-800">⭐ {stats.averageRating} avg rating</p>
            </div>
            <nav className="py-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      if (onClose) onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 ${
                      isActive ? "bg-blue-50 text-blue-600 border-r-4 border-blue-500" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{item.label}</span>
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
          </div>
        </>
      )}
    </>
  );
}
