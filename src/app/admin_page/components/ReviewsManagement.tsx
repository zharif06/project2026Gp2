"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { Star, Trash2, MessageSquare, Search, Filter, ThumbsUp, Flag } from "lucide-react";

interface ReviewsManagementProps {
  reviews: any[];
  onRefresh: () => void;
}

export default function ReviewsManagement({ reviews, onRefresh }: ReviewsManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortedReviews, setSortedReviews] = useState<any[]>([]);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Sort reviews by date (newest first) whenever reviews change
  useEffect(() => {
    const sorted = [...reviews].sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt || 0).getTime();
      const dateB = new Date(b.date || b.createdAt || 0).getTime();
      return dateB - dateA; // Descending - newest first
    });
    setSortedReviews(sorted);
  }, [reviews]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review? This action cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "reviews", id));
      setMessage({ type: "success", text: "✅ Review deleted!" });
      onRefresh();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "❌ Failed to delete" });
    }
  };

  const filteredReviews = sortedReviews.filter((review) => {
    const matchesSearch = review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          review.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          review.restaurantName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = ratingFilter === "all" || review.rating === parseInt(ratingFilter);
    return matchesSearch && matchesRating;
  });

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center">
        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No reviews yet</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Review Management</h1>
          <p className="text-gray-500 mt-1">Monitor and manage customer reviews</p>
        </div>
      </div>

      {message.text && (
        <div className={`mb-4 p-3 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by user, restaurant, or comment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white"
            />
          </div>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-700 bg-white"
          >
            <option value="all">All Ratings</option>
            <option value="5">⭐ 5 Stars</option>
            <option value="4">⭐ 4 Stars</option>
            <option value="3">⭐ 3 Stars</option>
            <option value="2">⭐ 2 Stars</option>
            <option value="1">⭐ 1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews List - Newest First */}
      <div className="space-y-4">
        {filteredReviews.map((review, index) => (
          <div key={review.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            {index === 0 && (
              <div className="mb-2 text-xs text-blue-500 font-semibold">📌 Latest Review</div>
            )}
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{review.userName?.charAt(0) || "U"}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{review.userName}</p>
                    <p className="text-sm text-gray-500">Reviewed {review.restaurantName}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 mb-2">
                  {[1,2,3,4,5].map(star => (
                    <Star key={star} className={`w-5 h-5 ${star <= review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                  ))}
                  <span className="text-sm text-gray-500 ml-2">{review.date}</span>
                </div>
                
                <p className="text-gray-700 mb-3">{review.comment}</p>
                
                {review.suggestion && (
                  <div className="bg-blue-50 rounded-lg p-3 mt-2">
                    <p className="text-sm text-blue-700 flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" /> Suggestion: {review.suggestion}
                    </p>
                  </div>
                )}
              </div>
              
              <button onClick={() => handleDelete(review.id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500">No reviews match your filters</p>
        </div>
      )}
    </div>
  );
}