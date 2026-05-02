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
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}