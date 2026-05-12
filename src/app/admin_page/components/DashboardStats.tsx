"use client";

import { 
  TrendingUp, 
  Users, 
  Utensils, 
  Star, 
  Clock, 
  CheckCircle,
  RefreshCw
} from "lucide-react";

interface DashboardStatsProps {
  stats: {
    totalRestaurants: number;
    pendingRestaurants: number;
    approvedRestaurants: number;
    totalUsers: number;
    totalReviews: number;
    averageRating: string;
  };
  onRefresh: () => void;
}

export default function DashboardStats({ stats, onRefresh }: DashboardStatsProps) {
  const statCards = [
    {
      title: "Total Restaurants",
      value: stats.totalRestaurants,
      icon: Utensils,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-100",
      textColor: "text-orange-600"
    },
    {
      title: "Pending Approval",
      value: stats.pendingRestaurants,
      icon: Clock,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-600"
    },
    {
      title: "Approved",
      value: stats.approvedRestaurants,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-100",
      textColor: "text-green-600"
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "from-blue-500 to-indigo-500",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600"
    },
    {
      title: "Total Reviews",
      value: stats.totalReviews,
      icon: Star,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600"
    },
    {
      title: "Average Rating",
      value: `⭐ ${stats.averageRating}`,
      icon: TrendingUp,
      color: "from-teal-500 to-cyan-500",
      bgColor: "bg-teal-100",
      textColor: "text-teal-600"
    }
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Welcome back! Here's what's happening with your platform today.</p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          <RefreshCw className="w-4 h-4 text-gray-600" />
          <span className="text-gray-600">Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className={`bg-gradient-to-r ${card.color} p-3 sm:p-4`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white/80 text-xs sm:text-sm font-medium">Total</p>
                    <p className="text-white text-sm sm:text-base font-bold">{card.title}</p>
                  </div>
                  <div className="bg-white/20 rounded-xl p-1.5 sm:p-2">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="p-3 sm:p-4 flex justify-between items-center">
                <span className="text-2xl sm:text-3xl font-bold text-gray-800">{card.value}</span>
                <div className={`${card.bgColor} rounded-full p-1.5 sm:p-2`}>
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${card.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions - Mobile Responsive */}
      <div className="mt-6 sm:mt-8 bg-white rounded-2xl shadow-lg p-4 sm:p-6 overflow-x-auto">
        <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          <button className="p-2 sm:p-4 bg-orange-50 rounded-xl text-center hover:bg-orange-100 transition-colors">
            <Utensils className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 mx-auto mb-1 sm:mb-2" />
            <p className="text-xs sm:text-sm font-medium text-gray-700">Add Restaurant</p>
          </button>
          <button className="p-2 sm:p-4 bg-blue-50 rounded-xl text-center hover:bg-blue-100 transition-colors">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mx-auto mb-1 sm:mb-2" />
            <p className="text-xs sm:text-sm font-medium text-gray-700">Add Staff</p>
          </button>
          <button className="p-2 sm:p-4 bg-green-50 rounded-xl text-center hover:bg-green-100 transition-colors">
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mx-auto mb-1 sm:mb-2" />
            <p className="text-xs sm:text-sm font-medium text-gray-700">Approve Pending</p>
          </button>
          <button className="p-2 sm:p-4 bg-purple-50 rounded-xl text-center hover:bg-purple-100 transition-colors">
            <Star className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 mx-auto mb-1 sm:mb-2" />
            <p className="text-xs sm:text-sm font-medium text-gray-700">Manage Reviews</p>
          </button>
        </div>
      </div>
    </div>
  );
}