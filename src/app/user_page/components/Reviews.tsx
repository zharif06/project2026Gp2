"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, where, addDoc, updateDoc, doc, deleteDoc, orderBy } from "firebase/firestore";
import { Star, Send, Heart, Bookmark, Search, X, Utensils, Check, MapPin, DollarSign } from "lucide-react";

type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  priceRange: string;
  estimatedCost: string;
  address: string;
  image: string;
  images: string[];
  rating: number;
};

type Review = {
  id: string;
  restaurantId: string;
  restaurantName: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  createdAt: string;
  timestamp: number;
};

export default function Reviews() {
  const [user, setUser] = useState<any>(null);
  const [activeSource, setActiveSource] = useState<"loves" | "saves" | "search">("loves");
  const [lovedRestaurants, setLovedRestaurants] = useState<Restaurant[]>([]);
  const [savedRestaurants, setSavedRestaurants] = useState<Restaurant[]>([]);
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Restaurant[]>([]);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        await loadData(user.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadData = async (userId: string) => {
    setLoading(true);
    try {
      // Load all approved restaurants
      const restaurantsQuery = query(collection(db, "restaurants"), where("status", "==", "approved"));
      const restaurantsSnapshot = await getDocs(restaurantsQuery);
      const restaurants: Restaurant[] = [];
      restaurantsSnapshot.forEach((doc) => {
        const data = doc.data();
        restaurants.push({ 
          id: doc.id, 
          name: data.name,
          cuisine: data.cuisine,
          priceRange: data.priceRange,
          estimatedCost: data.estimatedCost,
          address: data.address,
          image: data.images?.[0] || "https://placehold.co/400x200/e2e8f0/475569?text=Restaurant",
          images: data.images || [],
          rating: data.rating || 0
        });
      });
      setAllRestaurants(restaurants);

      // Load loves
      const lovesQuery = query(collection(db, "loves"), where("userId", "==", userId));
      const lovesSnapshot = await getDocs(lovesQuery);
      const lovedIds = lovesSnapshot.docs.map(doc => doc.data().restaurantId);
      const loved = restaurants.filter(r => lovedIds.includes(r.id));
      setLovedRestaurants(loved);

      // Load saves
      const savesQuery = query(collection(db, "saves"), where("userId", "==", userId));
      const savesSnapshot = await getDocs(savesQuery);
      const savedIds = savesSnapshot.docs.map(doc => doc.data().restaurantId);
      const saved = restaurants.filter(r => savedIds.includes(r.id));
      setSavedRestaurants(saved);

      // Load user reviews - ORDER BY timestamp DESC (newest first)
      try {
        const reviewsQuery = query(
          collection(db, "reviews"), 
          where("userId", "==", userId),
          orderBy("timestamp", "desc")
        );
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviews: Review[] = [];
        reviewsSnapshot.forEach((doc) => {
          const data = doc.data();
          reviews.push({
            id: doc.id,
            restaurantId: data.restaurantId,
            restaurantName: data.restaurantName,
            userId: data.userId,
            userName: data.userName,
            rating: data.rating,
            comment: data.comment,
            date: data.date,
            createdAt: data.createdAt,
            timestamp: data.timestamp || 0
          });
        });
        setUserReviews(reviews);
      } catch (orderError) {
        console.error("Order by error, using fallback:", orderError);
        const reviewsQuery2 = query(collection(db, "reviews"), where("userId", "==", userId));
        const reviewsSnapshot2 = await getDocs(reviewsQuery2);
        const reviews2: Review[] = [];
        reviewsSnapshot2.forEach((doc) => {
          const data = doc.data();
          reviews2.push({
            id: doc.id,
            restaurantId: data.restaurantId,
            restaurantName: data.restaurantName,
            userId: data.userId,
            userName: data.userName,
            rating: data.rating,
            comment: data.comment,
            date: data.date,
            createdAt: data.createdAt,
            timestamp: data.timestamp || 0
          });
        });
        // Sort manually by timestamp (newest first)
        reviews2.sort((a, b) => b.timestamp - a.timestamp);
        setUserReviews(reviews2);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setMessage("❌ Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      const results = allRestaurants.filter(r => 
        r.name.toLowerCase().includes(term.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleWriteReview = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setRating(5);
    setComment("");
    setShowReviewForm(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurant || !user) return;
    if (!comment.trim()) {
      setMessage("Please write a review");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setSubmitting(true);
    try {
      const now = new Date();
      const formattedDate = now.toISOString().split('T')[0];
      const timestamp = now.getTime(); // This is the key for sorting!
      
      const reviewData = {
        restaurantId: selectedRestaurant.id,
        restaurantName: selectedRestaurant.name,
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || "User",
        rating: rating,
        comment: comment,
        date: formattedDate,
        createdAt: now.toISOString(),
        timestamp: timestamp  // ← IMPORTANT: for sorting
      };

      const docRef = await addDoc(collection(db, "reviews"), reviewData);
      
      // Add to local state at the TOP
      const newReview: Review = {
        id: docRef.id,
        ...reviewData
      };
      
      setUserReviews(prev => [newReview, ...prev]);
      
      // Update restaurant rating
      const allReviewsQuery = query(collection(db, "reviews"), where("restaurantId", "==", selectedRestaurant.id));
      const allReviewsSnapshot = await getDocs(allReviewsQuery);
      const allReviews = allReviewsSnapshot.docs.map(doc => doc.data());
      const totalRating = allReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
      const avgRating = totalRating / allReviews.length;
      
      await updateDoc(doc(db, "restaurants", selectedRestaurant.id), {
        rating: avgRating,
        totalReviews: allReviews.length
      });

      setMessage("✅ Review submitted successfully!");
      
      setTimeout(() => {
        setMessage("");
        setShowReviewForm(false);
        setSelectedRestaurant(null);
      }, 2000);
    } catch (error) {
      console.error("Error submitting review:", error);
      setMessage("❌ Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string, restaurantId: string) => {
    if (confirm("Are you sure you want to delete this review?")) {
      try {
        await deleteDoc(doc(db, "reviews", reviewId));
        
        // Update local state
        setUserReviews(prev => prev.filter(r => r.id !== reviewId));
        
        // Update restaurant rating
        const allReviewsQuery = query(collection(db, "reviews"), where("restaurantId", "==", restaurantId));
        const allReviewsSnapshot = await getDocs(allReviewsQuery);
        const allReviews = allReviewsSnapshot.docs.map(doc => doc.data());
        if (allReviews.length > 0) {
          const totalRating = allReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
          const avgRating = totalRating / allReviews.length;
          await updateDoc(doc(db, "restaurants", restaurantId), {
            rating: avgRating,
            totalReviews: allReviews.length
          });
        } else {
          await updateDoc(doc(db, "restaurants", restaurantId), {
            rating: 0,
            totalReviews: 0
          });
        }
        
        setMessage("✅ Review deleted!");
        setTimeout(() => setMessage(""), 2000);
      } catch (error) {
        console.error("Error deleting review:", error);
      }
    }
  };

  const hasReviewed = (restaurantId: string) => {
    return userReviews.some(r => r.restaurantId === restaurantId);
  };

  const RestaurantCard = ({ restaurant }: { restaurant: Restaurant }) => {
    const reviewed = hasReviewed(restaurant.id);
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
        <div className="relative h-40">
          <img 
            src={restaurant.image} 
            alt={restaurant.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://placehold.co/400x200/e2e8f0/475569?text=Restaurant";
            }}
          />
          <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-lg text-xs font-semibold">
            {restaurant.estimatedCost}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-900">{restaurant.name}</h3>
          <p className="text-gray-500 text-sm">{restaurant.cuisine} • {restaurant.priceRange}</p>
          <div className="flex items-center gap-1 mt-1 text-gray-500 text-xs">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{restaurant.address}</span>
          </div>
          
          {reviewed ? (
            <div className="mt-3 text-green-600 text-sm flex items-center gap-1">
              <Check className="w-4 h-4" /> Already Reviewed
            </div>
          ) : (
            <button onClick={() => handleWriteReview(restaurant)} className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
              Write a Review
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="text-gray-900">
      <h1 className="text-2xl font-bold mb-6">Write a Review</h1>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${message.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message}
        </div>
      )}

      {/* Source Selection Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setActiveSource("loves")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
            activeSource === "loves" ? "bg-red-500 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Heart className={`w-4 h-4 ${activeSource === "loves" ? "fill-white" : ""}`} />
          My Loves ({lovedRestaurants.length})
        </button>
        
        <button
          onClick={() => setActiveSource("saves")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
            activeSource === "saves" ? "bg-blue-500 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Bookmark className={`w-4 h-4 ${activeSource === "saves" ? "fill-white" : ""}`} />
          My Bookmarks ({savedRestaurants.length})
        </button>
        
        <button
          onClick={() => setActiveSource("search")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
            activeSource === "search" ? "bg-green-500 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Search className="w-4 h-4" />
          Search Restaurant
        </button>
      </div>

      {/* Search Bar */}
      {activeSource === "search" && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search for a restaurant by name or cuisine..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Restaurant List */}
      {activeSource === "search" ? (
        <>
          {searchTerm && searchResults.length === 0 && (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
              <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No restaurants found for "{searchTerm}"</p>
            </div>
          )}
          {searchResults.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )}
        </>
      ) : activeSource === "loves" ? (
        <>
          {lovedRestaurants.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">You haven't loved any restaurants yet.</p>
              <p className="text-sm text-gray-400 mt-1">Click the heart ❤️ button on restaurants you like!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lovedRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {savedRestaurants.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
              <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">You haven't saved any restaurants yet.</p>
              <p className="text-sm text-gray-400 mt-1">Click the bookmark 📚 button on restaurants you like!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )}
        </>
      )}

      {/* My Existing Reviews Section - Sorted by timestamp (newest at TOP) */}
      {userReviews.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">My Reviews ({userReviews.length})</h2>
            <p className="text-xs text-gray-500">Latest reviews shown first</p>
          </div>
          <div className="space-y-3">
            {userReviews.map((review, index) => {
              const restaurant = allRestaurants.find(r => r.id === review.restaurantId);
              return (
                <div key={review.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                  <div className="flex gap-4">
                    {/* Restaurant Image */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      <img 
                        src={restaurant?.image || "https://placehold.co/100x100/e2e8f0/475569?text=Restaurant"} 
                        alt={review.restaurantName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/100x100/e2e8f0/475569?text=Restaurant";
                        }}
                      />
                    </div>
                    
                    {/* Review Content */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{review.restaurantName}</h3>
                          <div className="flex gap-1 my-1">
                            {[1,2,3,4,5].map(star => (
                              <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <p className="text-gray-700 text-sm">{review.comment}</p>
                          <p className="text-xs text-gray-400 mt-1">Reviewed on: {review.date}</p>
                        </div>
                        <button 
                          onClick={() => handleDeleteReview(review.id, review.restaurantId)} 
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {index === 0 && (
                    <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
                      <p className="text-xs text-blue-500 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" /> Most Recent Review
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Review Form Modal */}
      {showReviewForm && selectedRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-bold text-gray-900">Review {selectedRestaurant.name}</h3>
              <button onClick={() => { setShowReviewForm(false); setSelectedRestaurant(null); }} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleSubmitReview} className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(star => (
                    <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                      <Star className={`w-8 h-8 ${star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" placeholder="Share your experience..." required />
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
                <Send className="w-4 h-4 inline mr-2" />
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}