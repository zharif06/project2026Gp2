"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { deleteDoc, doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { X, Star, MessageSquare, Lightbulb, Trash2, Loader2 } from "lucide-react";

interface ReviewsModalProps {
  restaurantId: string;
  reviews: any[];
  onClose: () => void;
  onRefresh: () => void;
}

export default function ReviewsModal({ restaurantId, reviews, onClose, onRefresh }: ReviewsModalProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sortedReviews, setSortedReviews] = useState<any[]>([]);

  useEffect(() => {
    const sorted = [...reviews].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
    setSortedReviews(sorted);
  }, [reviews]);

  const restaurantName = reviews[0]?.restaurantName || "Restaurant";

  // Function to update restaurant rating after review deletion
  const updateRestaurantRating = async (restaurantId: string) => {
    try {
      const reviewsQuery = query(
        collection(db, "reviews"), 
        where("restaurantId", "==", restaurantId)
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const allReviews = reviewsSnapshot.docs.map(doc => doc.data());
      
      const totalRating = allReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
      const newRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;
      
      await updateDoc(doc(db, "restaurants", restaurantId), {
        rating: newRating,
        totalReviews: allReviews.length
      });
      
      console.log(`Restaurant ${restaurantId} updated: rating=${newRating}, totalReviews=${allReviews.length}`);
    } catch (error) {
      console.error("Error updating restaurant rating:", error);
    }
  };

  // DELETE FUNCTION - UNCOMMENT (staff boleh delete)
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    
    setDeletingId(reviewId);
    setMessage("");
    
    try {
      // STEP 1: Get the review to find restaurantId
      const reviewRef = doc(db, "reviews", reviewId);
      const reviewSnap = await getDoc(reviewRef);
      
      if (!reviewSnap.exists()) {
        setMessage("❌ Review not found");
        return;
      }
      
      const reviewData = reviewSnap.data();
      const targetRestaurantId = reviewData.restaurantId;
      
      console.log("Deleting review for restaurant:", targetRestaurantId);
      
      // STEP 2: Delete the review
      await deleteDoc(reviewRef);
      
      // STEP 3: Update restaurant rating
      if (targetRestaurantId) {
        await updateRestaurantRating(targetRestaurantId);
      }
      
      setMessage("✅ Review deleted & rating updated!");
      
      // STEP 4: Refresh the staff page data
      await onRefresh();
      
      setTimeout(() => setMessage(""), 2000);
      
    } catch (error: any) {
      console.error("Error deleting review:", error);
      setMessage(`❌ Failed: ${error.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-white" />
            <h3 className="text-xl font-bold text-white">
              Customer Reviews for {restaurantName}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        
        {message && (
          <div className={`m-4 p-3 rounded-lg ${message.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {message}
          </div>
        )}
        
        <div className="p-6">
          {sortedReviews.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No reviews yet for this restaurant</p>
            </div>
          ) : (
            <div className="space-y-5">
              {sortedReviews.map((review, index) => (
                <div key={review.id} className={`border-b pb-4 ${index === sortedReviews.length - 1 ? 'border-0' : 'border-gray-100'}`}>
                  {index === 0 && (
                    <div className="mb-2 text-xs text-blue-500 font-semibold">🆕 Latest Review</div>
                  )}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-800">{review.userName}</p>
                          <div className="flex gap-1 mt-1">
                            {[1,2,3,4,5].map(star => (
                              <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-400">{review.date}</p>
                      </div>
                      <p className="text-gray-600 mt-2 leading-relaxed">{review.comment}</p>
                      {review.suggestion && (
                        <div className="mt-3 bg-blue-50 rounded-xl p-3 border border-blue-100">
                          <div className="flex items-center gap-2 mb-1">
                            <Lightbulb className="w-4 h-4 text-blue-500" />
                            <span className="text-xs font-semibold text-blue-600">Customer Suggestion</span>
                          </div>
                          <p className="text-sm text-blue-700">{review.suggestion}</p>
                        </div>
                      )}
                    </div>
                    
                    
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      disabled={deletingId === review.id}
                      className="ml-3 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete this review"
                    >
                      {deletingId === review.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
