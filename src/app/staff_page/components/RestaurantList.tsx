"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { deleteDoc, doc } from "firebase/firestore";
import { Search, Utensils, Loader2, MapPin, DollarSign, Star, Clock, Edit, Trash2, MessageSquare, Calendar } from "lucide-react";

interface RestaurantListProps {
  restaurants: any[];
  onEdit: (restaurant: any) => void;
  onDelete: () => void;
  onViewReviews: (restaurantId: string) => void;
  getReviewsForRestaurant: (id: string) => any[];
}

export default function RestaurantList({ 
  restaurants, 
  onEdit, 
  onDelete, 
  onViewReviews,
  getReviewsForRestaurant 
}: RestaurantListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this restaurant?")) return;
    
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, "restaurants", id));
      setMessage({ type: "success", text: "✅ Restaurant deleted successfully!" });
      onDelete();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Delete error:", error);
      setMessage({ type: "error", text: "❌ Failed to delete restaurant." });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredRestaurants = restaurants.filter((restaurant: any) => {
    const matchesSearch = restaurant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          restaurant.cuisine?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || restaurant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "approved":
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">✅ Approved</span>;
      case "rejected":
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">❌ Rejected</span>;
      default:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">⏳ Pending</span>;
    }
  };

  const getOpeningDaysDisplay = (openingDays: string[]) => {
    if (!openingDays || openingDays.length === 0) return "Not specified";
    const shortDays = openingDays.map(day => day.slice(0, 3)).join(", ");
    return shortDays;
  };

  if (restaurants.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center">
        <Utensils className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-2">No restaurants yet</h3>
        <p className="text-sm sm:text-base text-gray-400">Start by adding your first restaurant</p>
      </div>
    );
  }

  return (
    <div>
      {message.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message.text}
        </div>
      )}

      {/* Search and Filters - Mobile Responsive */}
      <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or cuisine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white text-sm sm:text-base"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700 bg-white text-sm sm:text-base"
          >
            <option value="all">All Status</option>
            <option value="pending">⏳ Pending</option>
            <option value="approved">✅ Approved</option>
            <option value="rejected">❌ Rejected</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-3 sm:mb-4">
        <p className="text-xs sm:text-sm text-gray-500">
          Showing {filteredRestaurants.length} of {restaurants.length} restaurants
        </p>
      </div>

      {/* Restaurant Cards Grid - Mobile Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {filteredRestaurants.map((restaurant: any) => {
          const reviews = getReviewsForRestaurant(restaurant.id);
          const avgRating = reviews.length > 0 
            ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : null;
          
          return (
            <div key={restaurant.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
              {/* Image Section */}
              <div className="relative h-40 sm:h-48 overflow-hidden">
                <img
                  src={restaurant.images?.[0] || "https://placehold.co/400x300/e2e8f0/475569?text=No+Image"}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/400x300/e2e8f0/475569?text=No+Image";
                  }}
                />
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                  {getStatusBadge(restaurant.status)}
                </div>
                {avgRating && (
                  <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-white text-xs sm:text-sm font-semibold">{avgRating}</span>
                  </div>
                )}
              </div>
              
              {/* Content Section */}
              <div className="p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1">{restaurant.name}</h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-2">{restaurant.cuisine} • {restaurant.priceRange}</p>
                
                <div className="flex items-center gap-2 text-gray-500 text-xs sm:text-sm mb-2 sm:mb-3">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{restaurant.address}</span>
                </div>
                
                {/* Opening Days Display */}
                <div className="flex items-center gap-2 text-gray-500 text-xs mb-2 sm:mb-3">
                  <Calendar className="w-3 h-3" />
                  <span>Open: {getOpeningDaysDisplay(restaurant.openingDays)}</span>
                </div>
                
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                  <span className="text-xs sm:text-sm font-semibold text-gray-700">{restaurant.estimatedCost}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2 sm:mb-3 pt-2 border-t border-gray-100">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" /> {reviews.length} reviews
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {restaurant.hours?.split(' - ')[0] || "Not set"}
                  </span>
                </div>
                
                {/* Action Buttons - Mobile Responsive */}
                <div className="flex flex-wrap gap-2">
                  {reviews.length > 0 && (
                    <button
                      onClick={() => onViewReviews(restaurant.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-xs sm:text-sm font-medium"
                    >
                      <MessageSquare className="w-3 h-3" />
                      Reviews ({reviews.length})
                    </button>
                  )}
                  <button
                    onClick={() => onEdit(restaurant)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs sm:text-sm font-medium"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(restaurant.id)}
                    disabled={deletingId === restaurant.id}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs sm:text-sm font-medium disabled:opacity-50"
                  >
                    {deletingId === restaurant.id ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRestaurants.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-8 sm:p-12 text-center">
          <p className="text-gray-500 text-sm sm:text-base">No restaurants match your filters</p>
        </div>
      )}
    </div>
  );
}