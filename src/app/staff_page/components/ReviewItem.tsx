"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { deleteDoc, doc } from "firebase/firestore";
import { Star, Trash2, Loader2 } from "lucide-react";

interface ReviewItemProps {
  review: any;
  restaurantName: string;
  isLatest: boolean;
  onRefresh: () => void;
}

export default function ReviewItem({ review, restaurantName, isLatest, onRefresh }: ReviewItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "reviews", review.id));
      await onRefresh();
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${isLatest ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
      {isLatest && (
        <div className="mb-2 text-xs text-blue-600 font-semibold flex items-center gap-1">
          <Star className="w-3 h-3 fill-current" /> Latest Review
        </div>
      )}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-800">{restaurantName}</h3>
            <span className="text-xs text-gray-400">•</span>
            <p className="text-sm text-gray-500">by {review.userName}</p>
          </div>
          <div className="flex gap-1 my-2">
            {[1,2,3,4,5].map(star => (
              <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
            ))}
          </div>
          <p className="text-gray-700">{review.comment}</p>
          <p className="text-xs text-gray-400 mt-2">Reviewed on: {review.date}</p>
          {review.suggestion && (
            <div className="mt-3 bg-blue-50 rounded-lg p-2">
              <p className="text-sm text-blue-600">💡 Suggestion: {review.suggestion}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="ml-3 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          title="Delete this review"
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}