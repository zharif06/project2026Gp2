"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  Utensils, 
  Star, 
  RefreshCw,
  Award,
  Clock,
  DollarSign
} from "lucide-react";

interface AnalyticsDashboardProps {
  onRefresh?: () => void;
}

interface ChartData {
  name: string;
  value: number;
}

interface MonthlyData {
  month: string;
  count: number;
}

interface ReviewData {
  month: string;
  reviews: number;
}

interface StatusData {
  name: string;
  value: number;
}

interface TopRestaurant {
  name: string;
  avgRating: string;
  reviewCount: number;
}

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  priceRange: string;
  status: string;
  createdAt?: string;
  submittedAt?: string;
  rating?: number;
}

interface Review {
  id: string;
  restaurantId: string;
  restaurantName: string;
  rating: number;
  date: string;
}

const COLORS = ['#FF6B35', '#F7C35C', '#2E86AB', '#A23B72', '#F18F01', '#1A7431', '#6A0572', '#FF0A54'];

export default function AnalyticsDashboard({ onRefresh }: AnalyticsDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [cuisineData, setCuisineData] = useState<ChartData[]>([]);
  const [priceData, setPriceData] = useState<ChartData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [reviewData, setReviewData] = useState<ReviewData[]>([]);
  const [topRestaurants, setTopRestaurants] = useState<TopRestaurant[]>([]);
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    totalUsers: 0,
    totalReviews: 0,
    avgRating: 0,
    pendingApproval: 0,
    approvedThisMonth: 0
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Fetch restaurants
      const restaurantsSnap = await getDocs(collection(db, "restaurants"));
      const restaurants: Restaurant[] = restaurantsSnap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Restaurant));
      
      // Fetch users count
      const usersSnap = await getDocs(collection(db, "users"));
      const totalUsers = usersSnap.docs.length;
      
      // Fetch reviews
      const reviewsSnap = await getDocs(collection(db, "reviews"));
      const reviews: Review[] = reviewsSnap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Review));
      
      // Calculate stats
      const totalRestaurants = restaurants.length;
      const totalReviews = reviews.length;
      const avgRating = reviews.length > 0 
        ? (reviews.reduce((sum: number, r: Review) => sum + (r.rating || 0), 0) / reviews.length)
        : 0;
      const pendingApproval = restaurants.filter((r: Restaurant) => r.status === "pending").length;
      const approvedThisMonth = restaurants.filter((r: Restaurant) => {
        const createdAt = new Date(r.createdAt || r.submittedAt || "");
        const now = new Date();
        return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
      }).length;
      
      setStats({
        totalRestaurants,
        totalUsers,
        totalReviews,
        avgRating: parseFloat(avgRating.toFixed(1)),
        pendingApproval,
        approvedThisMonth
      });
      
      // Cuisine distribution
      const cuisineMap = new Map<string, number>();
      restaurants.forEach((r: Restaurant) => {
        const cuisine = r.cuisine || "Other";
        cuisineMap.set(cuisine, (cuisineMap.get(cuisine) || 0) + 1);
      });
      const cuisineDataArray: ChartData[] = Array.from(cuisineMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);
      setCuisineData(cuisineDataArray);
      
      // Price distribution
      const priceMap = new Map<string, number>();
      restaurants.forEach((r: Restaurant) => {
        const price = r.priceRange || "Budget";
        priceMap.set(price, (priceMap.get(price) || 0) + 1);
      });
      const priceDataArray: ChartData[] = Array.from(priceMap.entries()).map(([name, value]) => ({ name, value }));
      setPriceData(priceDataArray);
      
      // Status distribution
      const statusMap = new Map<string, number>();
      restaurants.forEach((r: Restaurant) => {
        const status = r.status || "pending";
        statusMap.set(status, (statusMap.get(status) || 0) + 1);
      });
      const statusDataArray: StatusData[] = Array.from(statusMap.entries()).map(([name, value]) => ({ 
        name: name === "approved" ? "Approved" : name === "pending" ? "Pending" : "Rejected", 
        value 
      }));
      setStatusData(statusDataArray);
      
      // Monthly restaurant additions
      const monthlyMap = new Map<string, number>();
      restaurants.forEach((r: Restaurant) => {
        const date = new Date(r.createdAt || r.submittedAt || "");
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (date.getFullYear() > 2000) {
          monthlyMap.set(monthYear, (monthlyMap.get(monthYear) || 0) + 1);
        }
      });
      const monthlyArray: MonthlyData[] = Array.from(monthlyMap.entries())
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-6);
      setMonthlyData(monthlyArray);
      
      // Monthly review trends
      const reviewMonthlyMap = new Map<string, number>();
      reviews.forEach((r: Review) => {
        const date = new Date(r.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (date.getFullYear() > 2000) {
          reviewMonthlyMap.set(monthYear, (reviewMonthlyMap.get(monthYear) || 0) + 1);
        }
      });
      const reviewMonthlyArray: ReviewData[] = Array.from(reviewMonthlyMap.entries())
        .map(([month, reviewsCount]) => ({ month, reviews: reviewsCount }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-6);
      setReviewData(reviewMonthlyArray);
      
      // Top rated restaurants
      const restaurantRatings = new Map<string, { total: number; count: number; name: string }>();
      reviews.forEach((r: Review) => {
        const restaurantId = r.restaurantId;
        if (!restaurantRatings.has(restaurantId)) {
          const restaurant = restaurants.find((res: Restaurant) => res.id === restaurantId);
          const restaurantName = r.restaurantName || (restaurant ? restaurant.name : "Unknown");
          restaurantRatings.set(restaurantId, { 
            total: 0, 
            count: 0, 
            name: restaurantName
          });
        }
        const data = restaurantRatings.get(restaurantId)!;
        data.total += r.rating;
        data.count += 1;
      });
      const topRated: TopRestaurant[] = Array.from(restaurantRatings.entries())
        .map(([, data]) => ({ 
          name: data.name, 
          avgRating: (data.total / data.count).toFixed(1),
          reviewCount: data.count
        }))
        .sort((a, b) => parseFloat(b.avgRating) - parseFloat(a.avgRating))
        .slice(0, 5);
      setTopRestaurants(topRated);
      
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchAnalyticsData();
    if (onRefresh) onRefresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">Platform performance and insights</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-gray-600" />
          <span className="text-gray-600">Refresh</span>
        </button>
      </div>

      {/* Stats Cards Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm">Total Restaurants</p>
              <p className="text-3xl font-bold mt-1">{stats.totalRestaurants}</p>
            </div>
            <Utensils className="w-8 h-8 text-blue-200" />
          </div>
          <div className="mt-3 flex items-center gap-2 text-blue-100 text-xs">
            <Clock className="w-3 h-3" />
            <span>{stats.approvedThisMonth} added this month</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-5 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm">Total Users</p>
              <p className="text-3xl font-bold mt-1">{stats.totalUsers}</p>
            </div>
            <Users className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-5 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 text-sm">Total Reviews</p>
              <p className="text-3xl font-bold mt-1">{stats.totalReviews}</p>
            </div>
            <Star className="w-8 h-8 text-purple-200" />
          </div>
          <div className="mt-3 flex items-center gap-1 text-purple-100 text-xs">
            <span>⭐ Average rating: {stats.avgRating}/5</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-5 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-orange-100 text-sm">Pending Approval</p>
              <p className="text-3xl font-bold mt-1">{stats.pendingApproval}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            Monthly Restaurant Additions
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="count" stroke="#FF6B35" fill="#FF6B35" fillOpacity={0.3} name="Restaurants" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-orange-500" />
            Restaurants by Cuisine
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={cuisineData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => {
                  const percentage = percent ? (percent * 100).toFixed(0) : 0;
                  return `${name}: ${percentage}%`;
                }}
                outerRadius={100}
                dataKey="value"
              >
                {cuisineData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Monthly Reviews Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reviewData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="reviews" fill="#F7C35C" name="Reviews" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            Restaurants by Price Range
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={priceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => {
                  const percentage = percent ? (percent * 100).toFixed(0) : 0;
                  return `${name}: ${percentage}%`;
                }}
                outerRadius={100}
                dataKey="value"
              >
                {priceData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Restaurant Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#2E86AB" name="Restaurants" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Top Rated Restaurants
          </h3>
          <div className="space-y-4">
            {topRestaurants.map((restaurant, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-blue-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{restaurant.name}</p>
                    <p className="text-xs text-gray-500">{restaurant.reviewCount} reviews</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-bold text-gray-800">{restaurant.avgRating}</span>
                </div>
              </div>
            ))}
            {topRestaurants.length === 0 && (
              <p className="text-gray-500 text-center py-8">No restaurants with reviews yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-500" />
          Key Insights
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white rounded-xl">
            <p className="text-2xl font-bold text-gray-800">
              {stats.totalRestaurants > 0 ? ((stats.totalReviews / stats.totalRestaurants) || 0).toFixed(1) : '0'}
            </p>
            <p className="text-xs text-gray-500">Avg reviews per restaurant</p>
          </div>
          <div className="text-center p-3 bg-white rounded-xl">
            <p className="text-2xl font-bold text-gray-800">
              {stats.totalUsers > 0 ? ((stats.totalReviews / stats.totalUsers) || 0).toFixed(1) : '0'}
            </p>
            <p className="text-xs text-gray-500">Avg reviews per user</p>
          </div>
          <div className="text-center p-3 bg-white rounded-xl">
            <p className="text-2xl font-bold text-gray-800">{stats.approvedThisMonth}</p>
            <p className="text-xs text-gray-500">Restaurants added this month</p>
          </div>
          <div className="text-center p-3 bg-white rounded-xl">
            <p className="text-2xl font-bold text-gray-800">{stats.pendingApproval}</p>
            <p className="text-xs text-gray-500">Awaiting approval</p>
          </div>
        </div>
      </div>
    </div>
  );
}