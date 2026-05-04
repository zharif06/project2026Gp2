"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, where, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { ArrowLeft, Star, MapPin, DollarSign, Clock, Phone, Navigation, Heart, Bookmark, Send, X, Globe, Lightbulb, Calendar } from "lucide-react";
import { PageType } from "../page";

interface RestaurantDetailsProps {
  restaurant: any;
  setCurrentPage: (page: PageType) => void;
}

interface Review {
  id: string;
  restaurantId: string;
  restaurantName: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  suggestion: string;
  date: string;
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function RestaurantDetails({ restaurant, setCurrentPage }: RestaurantDetailsProps) {
  const [user, setUser] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState("");
  const [userSuggestion, setUserSuggestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoved, setIsLoved] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        await fetchReviews();
        await checkUserInteractions(user.uid);
      }
    });
    return () => unsubscribe();
  }, [restaurant?.id]);

  const fetchReviews = async () => {
    if (!restaurant?.id) return;
    try {
      const q = query(collection(db, "reviews"), where("restaurantId", "==", restaurant.id));
      const snapshot = await getDocs(q);
      const reviewsData: Review[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        reviewsData.push({
          id: doc.id,
          restaurantId: data.restaurantId,
          restaurantName: data.restaurantName,
          userId: data.userId,
          userName: data.userName,
          rating: data.rating,
          comment: data.comment,
          suggestion: data.suggestion || "",
          date: data.date
        });
      });
      reviewsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setReviews(reviewsData);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const checkUserInteractions = async (userId: string) => {
    if (!restaurant?.id) return;
    try {
      const loveQuery = query(collection(db, "loves"), where("userId", "==", userId), where("restaurantId", "==", restaurant.id));
      const loveSnapshot = await getDocs(loveQuery);
      setIsLoved(!loveSnapshot.empty);

      const saveQuery = query(collection(db, "saves"), where("userId", "==", userId), where("restaurantId", "==", restaurant.id));
      const saveSnapshot = await getDocs(saveQuery);
      setIsSaved(!saveSnapshot.empty);
    } catch (error) {
      console.error("Error checking interactions:", error);
    }
  };

  const handleLove = async () => {
    if (!user) {
      setMessage("Please login to love this restaurant");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    try {
      if (isLoved) {
        const loveQuery = query(collection(db, "loves"), where("userId", "==", user.uid), where("restaurantId", "==", restaurant.id));
        const snapshot = await getDocs(loveQuery);
        snapshot.forEach(async (doc) => await deleteDoc(doc.ref));
        setIsLoved(false);
        setMessage("💔 Removed from loves");
      } else {
        await addDoc(collection(db, "loves"), {
          userId: user.uid,
          restaurantId: restaurant.id,
          createdAt: new Date().toISOString()
        });
        setIsLoved(true);
        setMessage("❤️ Added to your loves!");
      }
      setTimeout(() => setMessage(""), 2000);
    } catch (error) {
      console.error("Error toggling love:", error);
    }
  };

  const handleSave = async () => {
    if (!user) {
      setMessage("Please login to save this restaurant");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    try {
      if (isSaved) {
        const saveQuery = query(collection(db, "saves"), where("userId", "==", user.uid), where("restaurantId", "==", restaurant.id));
        const snapshot = await getDocs(saveQuery);
        snapshot.forEach(async (doc) => await deleteDoc(doc.ref));
        setIsSaved(false);
        setMessage("📖 Removed from bookmarks");
      } else {
        await addDoc(collection(db, "saves"), {
          userId: user.uid,
          restaurantId: restaurant.id,
          createdAt: new Date().toISOString()
        });
        setIsSaved(true);
        setMessage("🔖 Saved to your bookmarks!");
      }
      setTimeout(() => setMessage(""), 2000);
    } catch (error) {
      console.error("Error toggling save:", error);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setMessage("Please login to write a review");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    if (!userReview.trim()) {
      setMessage("Please write a review");
      return;
    }
    if (userRating === 0) {
      setMessage("Please select a rating");
      return;
    }

    setSubmitting(true);
    setMessage("");
    
    try {
      const reviewData = {
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || "User",
        rating: userRating,
        comment: userReview,
        suggestion: userSuggestion,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, "reviews"), reviewData);
      
      const newReview: Review = {
        id: docRef.id,
        ...reviewData
      };
      
      setReviews(prevReviews => [newReview, ...prevReviews]);
      
      const allRatings = [...reviews.map(r => r.rating), userRating];
      const totalRating = allRatings.reduce((sum, r) => sum + r, 0);
      const avgRating = totalRating / allRatings.length;
      
      await updateDoc(doc(db, "restaurants", restaurant.id), {
        rating: avgRating,
        totalReviews: allRatings.length
      });
      
      setUserRating(0);
      setUserReview("");
      setUserSuggestion("");
      setMessage("✅ Review submitted successfully!");
      
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error submitting review:", error);
      setMessage("❌ Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const openGoogleMaps = () => {
    if (restaurant.direction) {
      window.open(restaurant.direction, '_blank');
    } else if (restaurant.location?.lat && restaurant.location?.lng) {
      window.open(`https://maps.google.com/?q=${restaurant.location.lat},${restaurant.location.lng}`, '_blank');
    }
  };

  if (!restaurant) return <div className="text-gray-900">No restaurant selected</div>;

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : restaurant.rating?.toFixed(1) || "New";

  // Get today's open status
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const isOpenToday = restaurant.openingDays?.includes(today);
  const openingDaysList = restaurant.openingDays || [];

  return (
    <div className="text-gray-900">
      <button
        onClick={() => setCurrentPage("restaurants")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Restaurants
      </button>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${message.includes("✅") || message.includes("❤️") || message.includes("🔖") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="relative h-64 md:h-96">
          <img
            src={restaurant.images?.[0] || "https://placehold.co/800x500/e2e8f0/475569?text=Restaurant+Image"}
            alt={restaurant.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://placehold.co/800x500/e2e8f0/475569?text=Restaurant+Image";
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{restaurant.name}</h1>
            <div className="flex items-center gap-2 text-white">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span>{averageRating}</span>
              <span className="text-white/70">({reviews.length} reviews)</span>
              <span className="mx-2">•</span>
              <span>{restaurant.cuisine}</span>
            </div>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={handleLove} className="bg-white/90 backdrop-blur-sm p-3 rounded-full hover:scale-110 transition shadow-lg">
              <Heart className={`w-6 h-6 ${isLoved ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
            </button>
            <button onClick={handleSave} className="bg-white/90 backdrop-blur-sm p-3 rounded-full hover:scale-110 transition shadow-lg">
              <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-blue-500 text-blue-500' : 'text-gray-700'}`} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">About This Restaurant</h2>
                <p className="text-gray-700 leading-relaxed">{restaurant.description || "No description available."}</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Location & Hours</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-gray-700">{restaurant.address}</p>
                      <button onClick={openGoogleMaps} className="text-sm text-blue-600 hover:text-blue-700 mt-1 flex items-center gap-1">
                        <Navigation className="w-3 h-3" /> Get Directions
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">{restaurant.hours || "Not specified"}</span>
                  </div>
                  {/* NEW: Opening Days Display */}
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-gray-700 font-semibold">Opening Days:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {daysOfWeek.map(day => {
                          const isOpen = openingDaysList.includes(day);
                          const isToday = day === today;
                          return (
                            <span
                              key={day}
                              className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                isOpen
                                  ? isToday
                                    ? "bg-green-500 text-white"
                                    : "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-400 line-through"
                              }`}
                            >
                              {day.slice(0, 3)}
                              {isToday && isOpen && " (Today)"}
                            </span>
                          );
                        })}
                      </div>
                      {isOpenToday !== undefined && (
                        <p className={`text-sm mt-2 ${isOpenToday ? 'text-green-600' : 'text-red-600'}`}>
                          {isOpenToday ? "✅ Open today!" : "❌ Closed today"}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">{restaurant.phone || "Not available"}</span>
                  </div>
                  {restaurant.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-blue-600" />
                      <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
                <h3 className="text-lg font-bold text-gray-900 mb-2">💰 Cost Estimation</h3>
                <p className="text-3xl font-bold text-green-600 mb-2">{restaurant.estimatedCost}</p>
                <p className="text-sm text-gray-600">per meal (average)</p>
              </div>
            </div>
          </div>

          {/* Write Review Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Write a Review</h2>
            
            <form onSubmit={handleSubmitReview} className="bg-gray-50 rounded-xl p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(star => (
                    <button key={star} type="button" onClick={() => setUserRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                      <Star className={`w-8 h-8 ${star <= userRating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                <textarea value={userReview} onChange={(e) => setUserReview(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" placeholder="Share your experience..." required />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  Suggestion for the Restaurant (Optional)
                </label>
                <textarea value={userSuggestion} onChange={(e) => setUserSuggestion(e.target.value)} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" placeholder="Have a suggestion? Let them know..." />
              </div>
              
              <button type="submit" disabled={submitting} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                <Send className="w-4 h-4" />
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>

          {/* Customer Reviews Section */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Reviews ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <p className="text-gray-500">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review, index) => (
                  <div key={review.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    {index === 0 && <div className="mb-2 text-xs text-blue-500 font-semibold">⭐ Latest Review</div>}
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{review.userName}</p>
                        <div className="flex gap-1 mt-1">
                          {[1,2,3,4,5].map(star => (
                            <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">{review.date}</p>
                    </div>
                    <p className="text-gray-700 mt-2">{review.comment}</p>
                    {review.suggestion && (
                      <div className="mt-3 bg-blue-50 rounded-lg p-2 border border-blue-100">
                        <p className="text-sm text-blue-600 flex items-center gap-1">
                          <Lightbulb className="w-3 h-3" /> Suggestion: {review.suggestion}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}