// src/app/staff_page/components/DashboardStats.tsx
"use client";

import { TrendingUp, Utensils, Star, Clock, CheckCircle, RefreshCw, Plus } from "lucide-react";

interface DashboardStatsProps {
  stats: {
    totalRestaurants: number;
    pendingRestaurants: number;
    approvedRestaurants: number;
    totalReviews: number;
    averageRating: string;
  };
  onAddRestaurant: () => void;
  onRefresh: () => void;
}

export default function DashboardStats({ stats, onAddRestaurant, onRefresh }: DashboardStatsProps) {
  const statCards = [
    {
      title: "Total Restaurants",
      value: stats.totalRestaurants,
      icon: Utensils,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
      description: "Restaurants you've added"
    },
    {
      title: "Pending Approval",
      value: stats.pendingRestaurants,
      icon: Clock,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-600",
      description: "Waiting for admin review"
    },
    {
      title: "Approved",
      value: stats.approvedRestaurants,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      description: "Live on the platform"
    },
    {
      title: "Total Reviews",
      value: stats.totalReviews,
      icon: Star,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
      description: "Customer feedback received"
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome Back! 👋</h1>
          <p className="text-gray-500 mt-1">Here's an overview of your restaurant performance</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
            <span className="text-gray-600">Refresh</span>
          </button>
          <button
            onClick={onAddRestaurant}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Restaurant
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className={`bg-gradient-to-r ${card.color} p-3`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white/80 text-xs font-medium">Total</p>
                    <p className="text-white text-base font-bold">{card.title}</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-1.5">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
              <div className="p-4 flex justify-between items-center">
                <div>
                  <span className="text-2xl font-bold text-gray-800">{card.value}</span>
                  <p className="text-xs text-gray-400 mt-1">{card.description}</p>
                </div>
                <div className={`${card.bgColor} rounded-full p-2`}>
                  <Icon className={`w-4 h-4 ${card.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 mb-6 border border-blue-100">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 rounded-full p-2">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Quick Tip</p>
            <p className="text-xs text-gray-600">Add high-quality photos and detailed descriptions to get more customers!</p>
          </div>
        </div>
      </div>
    </div>
  );
}