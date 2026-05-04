"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { 
  Heart, 
  Bookmark, 
  Star, 
  TrendingUp, 
  Award,
  Compass,
  ArrowRight,
  Flame,
  Coffee,
  Pizza,
  UtensilsCrossed
} from "lucide-react";
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
  ResponsiveContainer
} from "recharts";
import { PageType } from "../page";

interface UserDashboardProps {
  setCurrentPage: (page: PageType) => void;
  user: any;
}

interface ReviewType {
  id: string;
  restaurantId: string;
  restaurantName: string;
  userName: string;
  rating: number;
  comment: string;
  suggestion: string;
  date: string;
}

interface RestaurantType {
  id: string;
  name: string;
  cuisine: string;
  priceRange: string;
  estimatedCost: string;
  address: string;
  images: string[];
  rating: number;
  status: string;
}

const COLORS = ['#FF6B35', '#F7C35C', '#2E86AB', '#A23B72', '#1A7431'];

export default function UserDashboard({ setCurrentPage, user }: UserDashboardProps) {
  const [stats, setStats] = useState({
    lovedCount: 0,
    savedCount: 0,
    reviewCount: 0
  });
  const [reviewData, setReviewData] = useState<any[]>([]);
  const [cuisineData, setCuisineData] = useState<any[]>([]);
  const [recentReviews, setRecentReviews] = useState<ReviewType[]>([]);
  const [recommendedRestaurants, setRecommendedRestaurants] = useState<RestaurantType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserStats();
      fetchReviewActivity();
      fetchCuisinePreferences();
      fetchRecentReviews();
      fetchRecommendations();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const lovesQuery = query(collection(db, "loves"), where("userId", "==", user.uid));
      const lovesSnap = await getDocs(lovesQuery);
      
      const savesQuery = query(collection(db, "saves"), where("userId", "==", user.uid));
      const savesSnap = await getDocs(savesQuery);
      
      const reviewsQuery = query(collection(db, "reviews"), where("userId", "==", user.uid));
      const reviewsSnap = await getDocs(reviewsQuery);
      
      setStats({
        lovedCount: lovesSnap.docs.length,
        savedCount: savesSnap.docs.length,
        reviewCount: reviewsSnap.docs.length
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchReviewActivity = async () => {
    try {
      const reviewsQuery = query(collection(db, "reviews"), where("userId", "==", user.uid));
      const reviewsSnap = await getDocs(reviewsQuery);
      
      const monthlyMap = new Map<string, number>();
      reviewsSnap.forEach((doc) => {
        const data = doc.data() as ReviewType;
        const date = new Date(data.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyMap.set(monthYear, (monthlyMap.get(monthYear) || 0) + 1);
      });
      
      const chartData = Array.from(monthlyMap.entries())
        .map(([month, reviews]) => ({ month, reviews }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-6);
      
      setReviewData(chartData);
    } catch (error) {
      console.error("Error fetching review activity:", error);
    }
  };

  const fetchCuisinePreferences = async () => {
    try {
      const lovesQuery = query(collection(db, "loves"), where("userId", "==", user.uid));
      const lovesSnap = await getDocs(lovesQuery);
      
      const cuisineMap = new Map<string, number>();
      
      for (const loveDoc of lovesSnap.docs) {
        const restaurantId = loveDoc.data().restaurantId;
        const restaurantDoc = await getDoc(doc(db, "restaurants", restaurantId));
        if (restaurantDoc.exists()) {
          const data = restaurantDoc.data() as RestaurantType;
          const cuisine = data.cuisine || "Other";
          cuisineMap.set(cuisine, (cuisineMap.get(cuisine) || 0) + 1);
        }
      }
      
      const chartData = Array.from(cuisineMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 4);
      
      setCuisineData(chartData);
    } catch (error) {
      console.error("Error fetching cuisine preferences:", error);
    }
  };

  const fetchRecentReviews = async () => {
    try {
      const reviewsQuery = query(collection(db, "reviews"), where("userId", "==", user.uid));
      const reviewsSnap = await getDocs(reviewsQuery);
      const reviews = reviewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReviewType))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);
      setRecentReviews(reviews);
    } catch (error) {
      console.error("Error fetching recent reviews:", error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const restaurantsSnap = await getDocs(collection(db, "restaurants"));
      const restaurants = restaurantsSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as RestaurantType))
        .filter(r => r.status === "approved")
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 3);
      setRecommendedRestaurants(restaurants);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const statsCards = [
    { icon: Heart, label: "Restaurants Loved", value: stats.lovedCount, bgColor: "bg-pink-100", iconColor: "text-pink-500" },
    { icon: Bookmark, label: "Saved for Later", value: stats.savedCount, bgColor: "bg-blue-100", iconColor: "text-blue-500" },
    { icon: Star, label: "Reviews Written", value: stats.reviewCount, bgColor: "bg-yellow-100", iconColor: "text-yellow-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 p-6 text-white">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-6 h-6 text-yellow-300" />
            <h1 className="text-xl md:text-2xl font-bold">Food Explorer Dashboard</h1>
          </div>
          <p className="text-orange-100 text-sm max-w-2xl">
            Track your food journey, discover new favorites, and share your experiences!
          </p>
          <button
            onClick={() => setCurrentPage("restaurants")}
            className="mt-4 bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2 text-sm group"
          >
            Start Exploring
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Stats Cards - with tutorial attribute */}
      <div data-tutorial="dashboard-stats" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${card.bgColor} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                  <p className="text-xs text-gray-500">{card.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Review Activity */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800">Review Activity</h3>
              <p className="text-xs text-gray-500">Your monthly review history</p>
            </div>
          </div>
          {reviewData.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Star className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No reviews yet</p>
              <button 
                onClick={() => setCurrentPage("restaurants")}
                className="mt-2 text-orange-500 hover:text-orange-600 text-sm font-medium"
              >
                Write your first review →
              </button>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={reviewData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#666', fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="reviews" fill="#FF6B35" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Cuisine Preferences */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
              <Award className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800">Cuisine Preferences</h3>
              <p className="text-xs text-gray-500">Your favorite food types</p>
            </div>
          </div>
          {cuisineData.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <UtensilsCrossed className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No favorites yet</p>
              <button 
                onClick={() => setCurrentPage("restaurants")}
                className="mt-2 text-orange-500 hover:text-orange-600 text-sm font-medium"
              >
                Discover cuisines →
              </button>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
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
                  outerRadius={70}
                  dataKey="value"
                >
                  {cuisineData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Reviews Section */}
      <div className="bg-white rounded-xl shadow-md p-5">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800">Recent Reviews</h3>
              <p className="text-xs text-gray-500">Your latest food experiences</p>
            </div>
          </div>
          {recentReviews.length > 0 && (
            <button 
              onClick={() => setCurrentPage("reviews")}
              className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
        {recentReviews.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Coffee className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No reviews yet. Start exploring restaurants!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentReviews.map((review) => (
              <div key={review.id} className="bg-gray-50 rounded-lg p-3 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">{review.restaurantName}</h4>
                    <div className="flex gap-0.5 mt-1">
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} className={`w-3 h-3 ${star <= review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{review.date}</span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">{review.comment}</p>
                {review.suggestion && (
                  <p className="text-xs text-blue-500 mt-1 truncate">💡 {review.suggestion}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommendations Section */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl shadow-md p-5">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800">Recommended for You</h3>
              <p className="text-xs text-gray-600">Based on your taste preference</p>
            </div>
          </div>
          <button 
            onClick={() => setCurrentPage("restaurants")}
            className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        {recommendedRestaurants.length === 0 ? (
          <p className="text-gray-500 text-center py-6 text-sm">Loading recommendations...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedRestaurants.map((restaurant) => (
              <div 
                key={restaurant.id}
                onClick={() => {
                  setCurrentPage("restaurants");
                }}
                className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                <div className="relative h-32 overflow-hidden">
                  <img 
                    src={restaurant.images?.[0] || "https://placehold.co/400x300"} 
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-1.5 py-0.5 rounded text-xs font-semibold">
                    {restaurant.estimatedCost}
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded">
                    <div className="flex items-center gap-0.5 text-yellow-400">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <span className="text-white text-xs">{restaurant.rating?.toFixed(1) || "New"}</span>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-bold text-gray-800 text-sm group-hover:text-orange-600 transition-colors">
                    {restaurant.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">{restaurant.cuisine} • {restaurant.priceRange}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}