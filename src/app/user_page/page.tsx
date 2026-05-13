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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

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
    closeSidebar();
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

  // Sidebar content component
  const SidebarContent = () => (
    <>
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {user?.email?.split('@')[0]}
            </h3>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Food Lover</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
        <button
          onClick={() => handleSetCurrentPage("dashboard")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
            currentPage === "dashboard" 
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md' 
              : isDarkMode 
                ? 'text-gray-300 hover:bg-gray-700' 
                : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => handleSetCurrentPage("restaurants")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
            currentPage === "restaurants" 
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md' 
              : isDarkMode 
                ? 'text-gray-300 hover:bg-gray-700' 
                : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Find Restaurants</span>
        </button>

        <button
          onClick={() => handleSetCurrentPage("reviews")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
            currentPage === "reviews" 
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md' 
              : isDarkMode 
                ? 'text-gray-300 hover:bg-gray-700' 
                : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>My Reviews</span>
        </button>
        
        <div className={`pt-3 mt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <button
            onClick={() => handleSetCurrentPage("profile")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
              currentPage === "profile" 
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md' 
                : isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
            }`}
          >
            <User className="w-4 h-4" />
            <span>My Profile</span>
          </button>

          <button
            onClick={() => handleSetCurrentPage("editProfile")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
              currentPage === "editProfile" 
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md' 
                : isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={() => handleSetCurrentPage("about")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
              currentPage === "about" 
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md' 
                : isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>About Us</span>
          </button>

          <button
            onClick={() => handleSetCurrentPage("contact")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
              currentPage === "contact" 
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md' 
                : isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Contact Us</span>
          </button>
        </div>

        <div className="pt-3 mt-2">
          <button
            onClick={() => setShowTutorial(true)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-600 hover:from-orange-100 hover:to-red-100'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Need Help?</span>
          </button>
        </div>
      </nav>
    </>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 shadow-lg transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white/90 backdrop-blur-md'}`}>
  <div className="w-full px-2 sm:px-4 md:px-6">
    <div className="flex justify-between items-center py-2 sm:py-3">
      {/* LEFT SECTION - Logo dan Menu */}
      <div className="flex items-center gap-1 sm:gap-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors min-h-[40px] min-w-[40px]"
        >
          <Menu className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-gray-700'}`} />
        </button>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-full blur-lg opacity-70"></div>
          <Utensils className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 relative z-10" />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-sm sm:text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            MakanBajet
          </h1>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Food Discovery Platform</p>
        </div>
        {/* Mobile logo text */}
        <div className="sm:hidden">
          <h1 className="text-sm font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            MakanBajet
          </h1>
        </div>
      </div>

      {/* RIGHT SECTION - User menu */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Dark mode toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-1.5 sm:p-2 rounded-full transition-colors ${isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}
        >
          {isDarkMode ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        </button>

        {/* User info - hidden on mobile */}
        <div className="hidden sm:block text-right">
          <p className={`text-xs sm:text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            {user?.email?.split('@')[0]}
          </p>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Food Lover</p>
        </div>

        {/* Avatar */}
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-xs sm:text-sm">
            {user?.email?.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Sign Out button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-xs sm:text-sm"
        >
          <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </div>
  </div>
</header>

      <div className="flex relative">
        {/* DESKTOP SIDEBAR */}
        <aside className={`hidden lg:block fixed left-0 top-0 w-64 h-screen bg-white shadow-lg z-30 overflow-y-auto transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <SidebarContent />
        </aside>

        {/* MOBILE SIDEBAR */}
        <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${isSidebarOpen ? 'visible' : 'invisible'}`}>
          <div 
            className={`absolute inset-0 bg-black transition-opacity duration-300 ${isSidebarOpen ? 'opacity-50' : 'opacity-0'}`}
            onClick={closeSidebar}
          />
          <div className={`absolute left-0 top-0 h-full w-64 bg-white shadow-xl transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className={`p-3 border-b flex justify-between items-center ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'}`}>
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-orange-500" />
                <span className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Menu</span>
              </div>
              <button onClick={closeSidebar} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className={`w-4 h-4 ${isDarkMode ? 'text-white' : 'text-gray-600'}`} />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>

        {/* Main Content */}
        <main className={`flex-1 min-h-screen p-4 md:p-6 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
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
