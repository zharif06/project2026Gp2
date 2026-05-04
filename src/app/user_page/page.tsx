"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { 
  User, 
  Settings, 
  Info, 
  Phone, 
  Star,
  LogOut,
  Utensils,
  Compass,
  TrendingUp,
  HelpCircle,
  Sun,
  Moon,
  Menu,
  X
} from "lucide-react";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfile";
import ChangePassword from "./components/ChangePassword";
import AboutUs from "./components/AboutUs";
import ContactUs from "./components/ContactUs";
import RestaurantFinder from "./components/RestaurantFinder";
import RestaurantDetails from "./components/RestaurantDetails";
import Reviews from "./components/Reviews";
import UserDashboard from "./components/UserDashboard";
import OnboardingTutorial from "./components/OnboardingTutorial";

export type PageType = 
  | "profile" 
  | "editProfile" 
  | "changePassword" 
  | "about" 
  | "contact" 
  | "restaurants" 
  | "restaurantDetails" 
  | "reviews"
  | "dashboard";

export default function UserPage() {
  const [currentPage, setCurrentPage] = useState<PageType>("dashboard");
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/login_page");
      } else {
        setUser(user);
        
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const hasSeenTutorial = userDoc.data()?.hasSeenTutorial;
        if (!hasSeenTutorial) {
          setShowTutorial(true);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login_page");
  };

  const handleSetCurrentPage = (page: PageType) => {
    setCurrentPage(page);
    setIsSidebarOpen(false);
  };

  const renderPage = () => {
    switch(currentPage) {
      case "dashboard":
        return <UserDashboard setCurrentPage={handleSetCurrentPage} user={user} />;
      case "profile":
        return <Profile user={user} setCurrentPage={handleSetCurrentPage} />;
      case "editProfile":
        return <EditProfile user={user} setCurrentPage={handleSetCurrentPage} />;
      case "changePassword":
        return <ChangePassword setCurrentPage={handleSetCurrentPage} />;
      case "about":
        return <AboutUs />;
      case "contact":
        return <ContactUs />;
      case "restaurants":
        return <RestaurantFinder setCurrentPage={handleSetCurrentPage} setSelectedRestaurant={setSelectedRestaurant} />;
      case "restaurantDetails":
        return <RestaurantDetails restaurant={selectedRestaurant} setCurrentPage={handleSetCurrentPage} />;
      case "reviews":
        return <Reviews />;
      default:
        return <UserDashboard setCurrentPage={handleSetCurrentPage} user={user} />;
    }
  };

  const isFullWidthPage = currentPage === "dashboard";

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 shadow-lg transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white/90 backdrop-blur-md'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
              >
                <Menu className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-700'}`} />
              </button>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-full blur-lg opacity-70"></div>
                <Utensils className="w-9 h-9 text-orange-500 relative z-10" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  MakanBajet
                </h1>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Food Discovery Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {user?.email?.split('@')[0]}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Food Lover</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className="relative flex">
        <aside 
          className={`
            fixed lg:relative top-0 left-0 w-72 shadow-2xl z-50 transition-transform duration-300 ease-in-out
            ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0
          `}
          style={{ top: 0, height: '100vh', display: 'flex', flexDirection: 'column' }}
        >
          {/* Sidebar Header - Mobile only */}
          <div className={`p-4 border-b flex justify-between items-center lg:hidden ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex items-center gap-2">
              <Utensils className="w-6 h-6 text-orange-500" />
              <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Menu</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-gray-600'}`} />
            </button>
          </div>

          {/* User Profile Summary */}
          <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {user?.email?.split('@')[0]}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Food Lover</p>
              </div>
            </div>
          </div>

          {/* Navigation - All menu items */}
          <nav className="flex-1 overflow-y-auto py-2 px-4 space-y-1">
            <button
              onClick={() => handleSetCurrentPage("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                currentPage === "dashboard" 
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md' 
                  : isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                    : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </button>

            <button
              onClick={() => handleSetCurrentPage("restaurants")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                currentPage === "restaurants" 
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md' 
                  : isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                    : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
              }`}
            >
              <Compass className="w-5 h-5" />
              <span className="font-medium">Find Restaurants</span>
            </button>

            <button
              onClick={() => handleSetCurrentPage("reviews")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                currentPage === "reviews" 
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md' 
                  : isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                    : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
              }`}
            >
              <Star className="w-5 h-5" />
              <span className="font-medium">My Reviews</span>
            </button>
            
            <div className={`pt-4 mt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <button
                onClick={() => handleSetCurrentPage("profile")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  currentPage === "profile" 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md' 
                    : isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                      : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">My Profile</span>
              </button>

              <button
                onClick={() => handleSetCurrentPage("editProfile")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  currentPage === "editProfile" 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md' 
                    : isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                      : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Edit Profile</span>
              </button>

              <button
                onClick={() => handleSetCurrentPage("about")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  currentPage === "about" 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md' 
                    : isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                      : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                <Info className="w-5 h-5" />
                <span className="font-medium">About Us</span>
              </button>

              <button
                onClick={() => handleSetCurrentPage("contact")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  currentPage === "contact" 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md' 
                    : isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                      : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                <Phone className="w-5 h-5" />
                <span className="font-medium">Contact Us</span>
              </button>
            </div>

            {/* Need Help Button - Moved up inside nav, right after Contact Us */}
            <div className="pt-4 mt-2">
              <button
                onClick={() => setShowTutorial(true)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-600 hover:from-orange-100 hover:to-red-100'
                }`}
              >
                <HelpCircle className="w-5 h-5" />
                <span className="font-medium">Need Help?</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen p-6 md:p-8">
          <div className={isFullWidthPage ? '' : 'max-w-7xl mx-auto'}>
            {renderPage()}
          </div>
        </main>
      </div>

      {/* Onboarding Tutorial */}
      {showTutorial && (
        <OnboardingTutorial 
          onClose={() => setShowTutorial(false)} 
          userId={user?.uid}
        />
      )}
    </div>
  );
}