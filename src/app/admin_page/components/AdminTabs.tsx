"use client";

import { Users, MessageSquare, Plus } from "lucide-react";

interface AdminTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  usersCount: number;
  reviewsCount: number;
}

export default function AdminTabs({ 
  activeTab, 
  onTabChange, 
  pendingCount, 
  approvedCount, 
  rejectedCount, 
  usersCount, 
  reviewsCount 
}: AdminTabsProps) {
  
  const tabs = [
    { id: "pending", label: "Pending", count: pendingCount, color: "yellow" },
    { id: "approved", label: "Approved", count: approvedCount, color: "green" },
    { id: "rejected", label: "Rejected", count: rejectedCount, color: "red" },
    { id: "users", label: "Users", count: usersCount, color: "blue", icon: Users },
    { id: "reviews", label: "Reviews", count: reviewsCount, color: "purple", icon: MessageSquare },
    { id: "add", label: "Add Restaurant", icon: Plus, color: "blue" },
  ];

  return (
    <div className="border-b border-gray-200 mb-6 overflow-x-auto">
      <nav className="flex space-x-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`pb-4 px-1 font-medium whitespace-nowrap transition-colors ${
                isActive 
                  ? `border-b-2 border-${tab.color}-600 text-${tab.color}-600` 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {Icon && <Icon className="w-4 h-4 inline mr-1" />}
              {tab.label}
              {tab.count !== undefined && (
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                  isActive ? `bg-${tab.color}-100 text-${tab.color}-700` : "bg-gray-100 text-gray-600"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}