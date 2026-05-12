"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import AdminHeader from "./components/AdminHeader";
import AdminSidebar from "./components/AdminSidebar";
import DashboardStats from "./components/DashboardStats";
import UsersManagement from "./components/UsersManagement";
import RestaurantsManagement from "./components/RestaurantsManagement";
import ReviewsManagement from "./components/ReviewsManagement";
import AnalyticsDashboard from "./components/AnalyticsDashboard";

type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  priceRange: string;
  estimatedCost: string;
  address: string;
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

type UserType = {
  id: string;
  email: string;
  role: string;
  name: string;
  createdAt: string;
  lastLogin: string;
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
  status: string;
};

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start closed on mobile
  const router = useRouter();

  // Close sidebar when clicking outside on mobile
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/login_page");
      } else {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userRole = userDoc.data()?.role;
        
        if (userRole !== "admin") {
          router.push("/user_page");
          return;
        }
        
        setUser(user);
        await fetchAllData();
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchRestaurants(),
      fetchUsers(),
      fetchReviews()
    ]);
  };

  const fetchRestaurants = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "restaurants"));
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

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData: UserType[] = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() } as UserType);
      });
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "reviews"));
      const reviewsData: Review[] = [];
      querySnapshot.forEach((doc) => {
        reviewsData.push({ id: doc.id, ...doc.data() } as Review);
      });
      setReviews(reviewsData);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const refreshData = async () => {
    await fetchAllData();
  };

  const getStats = () => {
    return {
      totalRestaurants: restaurants.length,
      pendingRestaurants: restaurants.filter(r => r.status === "pending").length,
      approvedRestaurants: restaurants.filter(r => r.status === "approved").length,
      totalUsers: users.length,
      totalReviews: reviews.length,
      averageRating: reviews.length > 0 
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : "0"
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      <AdminHeader 
        user={user} 
        onLogout={() => auth.signOut().then(() => router.push("/login_page"))}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex relative">
        {/* Overlay for mobile when sidebar is open */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={closeSidebar}
          />
        )}
        
        <AdminSidebar 
          activeTab={activeTab} 
          onTabChange={(tab) => {
            setActiveTab(tab);
            setSidebarOpen(false); // Close sidebar after clicking on mobile
          }}
          isOpen={sidebarOpen}
        />
        
        <main className={`flex-1 transition-all duration-300 p-3 sm:p-4 md:p-6 w-full ${sidebarOpen ? 'overflow-hidden' : ''}`}>
          <div className="max-w-7xl mx-auto">
            {activeTab === "dashboard" && (
              <DashboardStats 
                stats={getStats()} 
                onRefresh={refreshData}
              />
            )}
            
            {activeTab === "analytics" && (
              <AnalyticsDashboard onRefresh={refreshData} />
            )}
            
            {activeTab === "users" && (
              <UsersManagement 
                users={users} 
                currentUser={user} 
                onRefresh={refreshData}
              />
            )}
            
            {activeTab === "restaurants" && (
              <RestaurantsManagement 
                restaurants={restaurants} 
                currentUser={user}
                onRefresh={refreshData}
              />
            )}
            
            {activeTab === "reviews" && (
              <ReviewsManagement 
                reviews={reviews} 
                onRefresh={refreshData}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}