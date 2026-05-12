"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Utensils, 
  LogOut, 
  MapPin, 
  DollarSign,
  Star,
  Clock,
  Phone,
  X,
  Save,
  Loader2,
  MessageSquare,
  CheckCircle
} from "lucide-react";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  getDoc
} from "firebase/firestore";
import { uploadMultipleToCloudinary } from "@/lib/cloudinary";
import StaffHeader from "./components/StaffHeader";
import StaffSidebar from "./components/StaffSidebar";
import DashboardStats from "./components/DashboardStats";
import RestaurantList from "./components/RestaurantList";
import AddEditRestaurantModal from "./components/AddEditRestaurantModal";
import ReviewsModal from "./components/ReviewsModal";
import ReviewItem from "./components/ReviewItem";

type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  priceRange: string;
  estimatedCost: string;
  address: string;
  state: string;
  area: string;
  location: { lat: number; lng: number };
  description: string;
  phone: string;
  hours: string;
  website: string;
  direction: string;
  menu: string[];
  images: string[];
  rating: number;
  totalReviews: number;
  status: "pending" | "approved" | "rejected";
  submittedBy: string;
  submittedAt: string;
};

type Review = {
  id: string;
  restaurantId: string;
  restaurantName: string;
  userName: string;
  rating: number;
  comment: string;
  suggestion: string;
  date: string;
};

export default function StaffPage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/login_page");
      } else {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userRole = userDoc.data()?.role;
        
        if (userRole !== "staff" && userRole !== "admin") {
          router.push("/user_page");
          return;
        }
        
        setUser(user);
        await Promise.all([
          fetchMyRestaurants(user.uid),
          fetchReviewsForMyRestaurants(user.uid)
        ]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const fetchMyRestaurants = async (userId: string) => {
    try {
      const q = query(collection(db, "restaurants"), where("submittedBy", "==", userId));
      const querySnapshot = await getDocs(q);
      const restaurantsData: Restaurant[] = [];
      querySnapshot.forEach((doc) => {
        restaurantsData.push({ id: doc.id, ...doc.data() } as Restaurant);
      });
      restaurantsData.sort((a, b) => 
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
      setRestaurants(restaurantsData);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  const fetchReviewsForMyRestaurants = async (userId: string) => {
    try {
      const myRestaurantsQuery = query(collection(db, "restaurants"), where("submittedBy", "==", userId));
      const myRestaurantsSnapshot = await getDocs(myRestaurantsQuery);
      const restaurantIds = myRestaurantsSnapshot.docs.map(doc => doc.id);
      
      if (restaurantIds.length === 0) {
        setReviews([]);
        return;
      }
      
      const allReviewsSnapshot = await getDocs(collection(db, "reviews"));
      const allReviews: Review[] = [];
      
      allReviewsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (restaurantIds.includes(data.restaurantId)) {
          allReviews.push({
            id: doc.id,
            restaurantId: data.restaurantId,
            restaurantName: data.restaurantName || "Unknown",
            userName: data.userName || "Anonymous",
            rating: data.rating || 0,
            comment: data.comment || "",
            suggestion: data.suggestion || "",
            date: data.date || new Date().toISOString().split('T')[0]
          });
        }
      });
      
      allReviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setReviews(allReviews);
      
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    }
  };

  const refreshData = async () => {
    if (user) {
      await Promise.all([
        fetchMyRestaurants(user.uid),
        fetchReviewsForMyRestaurants(user.uid)
      ]);
    }
  };

  const getStats = () => {
    return {
      totalRestaurants: restaurants.length,
      pendingRestaurants: restaurants.filter(r => r.status === "pending").length,
      approvedRestaurants: restaurants.filter(r => r.status === "approved").length,
      totalReviews: reviews.length,
      averageRating: reviews.length > 0 
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : "0"
    };
  };

  const handleEditRestaurant = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setShowAddModal(true);
  };

  const handleViewReviews = (restaurantId: string) => {
    setSelectedRestaurantId(restaurantId);
    setShowReviewsModal(true);
  };

  const getReviewsForRestaurant = (restaurantId: string) => {
    return reviews.filter(r => r.restaurantId === restaurantId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <StaffHeader 
        user={user} 
        onLogout={() => auth.signOut().then(() => router.push("/login_page"))}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex">
        <StaffSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          isOpen={sidebarOpen}
          stats={getStats()}
        />
        
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'} p-3 sm:p-4 md:p-6`}>
          <div className="max-w-7xl mx-auto">
            {activeTab === "dashboard" && (
              <>
                <DashboardStats 
                  stats={getStats()} 
                  onAddRestaurant={() => {
                    setEditingRestaurant(null);
                    setShowAddModal(true);
                  }}
                  onRefresh={refreshData}
                />
                <div className="mt-6">
                  <h2 className="text-base sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Recent Restaurants</h2>
                  <RestaurantList 
                    restaurants={restaurants.slice(0, 3)}
                    onEdit={handleEditRestaurant}
                    onDelete={refreshData}
                    onViewReviews={handleViewReviews}
                    getReviewsForRestaurant={getReviewsForRestaurant}
                  />
                  {restaurants.length > 3 && (
                    <button
                      onClick={() => setActiveTab("restaurants")}
                      className="mt-3 sm:mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
                    >
                      View all {restaurants.length} restaurants →
                    </button>
                  )}
                </div>
              </>
            )}
            
            {activeTab === "restaurants" && (
              <RestaurantList 
                restaurants={restaurants}
                onEdit={handleEditRestaurant}
                onDelete={refreshData}
                onViewReviews={handleViewReviews}
                getReviewsForRestaurant={getReviewsForRestaurant}
              />
            )}
            
            {activeTab === "reviews" && (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">All Customer Reviews</h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Showing {reviews.length} review{reviews.length !== 1 ? 's' : ''} for your restaurants
                    </p>
                  </div>
                  <button
                    onClick={refreshData}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs sm:text-sm w-full sm:w-auto"
                  >
                    Refresh
                  </button>
                </div>
                
                {reviews.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm sm:text-base">No reviews yet for your restaurants</p>
                    <p className="text-xs sm:text-sm text-gray-400 mt-2">
                      Once customers leave reviews, they will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {reviews.map((review, idx) => {
                      const restaurant = restaurants.find(r => r.id === review.restaurantId);
                      return (
                        <ReviewItem
                          key={review.id}
                          review={review}
                          restaurantName={review.restaurantName || restaurant?.name || "Unknown Restaurant"}
                          isLatest={idx === 0}
                          onRefresh={refreshData}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {showAddModal && (
        <AddEditRestaurantModal 
          restaurant={editingRestaurant}
          user={user}
          onClose={() => {
            setShowAddModal(false);
            setEditingRestaurant(null);
          }}
          onRefresh={refreshData}
        />
      )}

      {showReviewsModal && selectedRestaurantId && (
        <ReviewsModal 
          restaurantId={selectedRestaurantId}
          reviews={reviews.filter(r => r.restaurantId === selectedRestaurantId)}
          onClose={() => {
            setShowReviewsModal(false);
            setSelectedRestaurantId(null);
          }}
          onRefresh={refreshData}
        />
      )}
    </div>
  );
}