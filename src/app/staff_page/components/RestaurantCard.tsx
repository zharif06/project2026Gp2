// src/app/staff_page/components/RestaurantCard.tsx
"use client";

import { MapPin, DollarSign, Star, Clock, Edit, Trash2, MessageSquare, Loader2 } from "lucide-react";

interface RestaurantCardProps {
  restaurant: any;
  reviewsCount: number;
  averageRating: string | null;
  onEdit: () => void;
  onDelete: () => void;
  onViewReviews: () => void;
  isDeleting: boolean;
}

export default function RestaurantCard({ 
  restaurant, 
  reviewsCount, 
  averageRating, 
  onEdit, 
  onDelete, 
  onViewReviews,
  isDeleting 
}: RestaurantCardProps) {
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "approved":
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">✅ Approved</span>;
      case "rejected":
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold flex items-center gap-1">❌ Rejected</span>;
      default:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold flex items-center gap-1">⏳ Pending</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={restaurant.images?.[0] || "https://placehold.co/400x300/e2e8f0/475569?text=No+Image"}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          {getStatusBadge(restaurant.status)}
        </div>
        {averageRating && (
          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-500 fill-current" />
            <span className="text-white text-sm font-semibold">{averageRating}</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">{restaurant.name}</h3>
        <p className="text-gray-500 text-sm mb-2">{restaurant.cuisine} • {restaurant.priceRange}</p>
        
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{restaurant.address}</span>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="text-sm font-semibold text-gray-700">{restaurant.estimatedCost}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-3 pt-2 border-t border-gray-100">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3" /> {reviewsCount} reviews
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {restaurant.hours?.split(' - ')[0] || "Not set"}
          </span>
        </div>
        
        <div className="flex gap-2">
          {reviewsCount > 0 && (
            <button
              onClick={onViewReviews}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
            >
              <MessageSquare className="w-3 h-3" />
              Reviews ({reviewsCount})
            </button>
          )}
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            <Edit className="w-3 h-3" />
            Edit
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}