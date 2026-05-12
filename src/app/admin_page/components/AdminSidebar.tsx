"use client";

import { 
  LayoutDashboard, 
  Users, 
  Utensils, 
  MessageSquare,
  TrendingUp,
  X
} from "lucide-react";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ activeTab, onTabChange, isOpen, onClose }: AdminSidebarProps) {
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

  // If this is mobile sidebar (with onClose function)
  if (onClose) {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Admin Menu</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <nav className="flex-1 py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 ${
                  isActive 
                    ? "bg-orange-50 text-orange-600 border-r-4 border-orange-500" 
                    : "text-gray-700 hover:bg-gray-50"
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

  // Desktop sidebar
  return (
    <aside className="fixed left-0 top-16 w-64 bg-white shadow-lg h-[calc(100vh-4rem)] overflow-y-auto">
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
    </aside>
  );
}