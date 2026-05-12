"use client";

import { 
  LayoutDashboard, 
  Users, 
  Utensils, 
  MessageSquare,
  TrendingUp
} from "lucide-react";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
}

export default function AdminSidebar({ activeTab, onTabChange, isOpen }: AdminSidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "orange" },
    { id: "analytics", label: "Analytics", icon: TrendingUp, color: "indigo" },
    { id: "users", label: "User Management", icon: Users, color: "blue" },
    { id: "restaurants", label: "Restaurants", icon: Utensils, color: "green" },
    { id: "reviews", label: "Reviews", icon: MessageSquare, color: "purple" },
  ];

  const getColorClasses = (color: string, isActive: boolean) => {
    if (!isActive) return "text-gray-600 hover:bg-gray-100";
    switch(color) {
      case "orange": return "bg-orange-100 text-orange-700 border-orange-500";
      case "indigo": return "bg-indigo-100 text-indigo-700 border-indigo-500";
      case "blue": return "bg-blue-100 text-blue-700 border-blue-500";
      case "green": return "bg-green-100 text-green-700 border-green-500";
      case "purple": return "bg-purple-100 text-purple-700 border-purple-500";
      default: return "bg-gray-100 text-gray-700 border-gray-500";
    }
  };

  // Mobile sidebar (overlay)
  if (isOpen) {
    return (
      <>
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => onTabChange(activeTab)} // This should be a close function, but we'll handle differently
        />
        {/* Sidebar for mobile */}
        <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-50 overflow-y-auto lg:relative lg:translate-x-0">
          <div className="p-4 border-b border-gray-100 lg:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-xl">
                  <LayoutDashboard className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-gray-800">Admin Menu</span>
              </div>
              <button 
                onClick={() => onTabChange(activeTab)} 
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
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
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 ${
                    isActive 
                      ? getColorClasses(item.color, true) 
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </>
    );
  }

  // Desktop sidebar (collapsed)
  return (
    <div className="hidden lg:block fixed left-0 top-16 w-64 bg-white shadow-lg h-[calc(100vh-4rem)] z-30 overflow-y-auto">
      <nav className="mt-6">
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
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}