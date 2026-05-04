"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, where, addDoc, deleteDoc, doc } from "firebase/firestore";
import { 
  MapPin, 
  Search, 
  Filter, 
  DollarSign, 
  Utensils, 
  Navigation, 
  Star, 
  Heart, 
  Bookmark,
  X,
  Clock,
  Calendar
} from "lucide-react";
import { PageType } from "../page";

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
  openingDays: string[];
  images: string[];
  rating: number;
  totalReviews: number;
  status: string;
  submittedAt: string;
};

interface RestaurantFinderProps {
  setCurrentPage: (page: PageType) => void;
  setSelectedRestaurant: (restaurant: any) => void;
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function RestaurantFinder({ setCurrentPage, setSelectedRestaurant }: RestaurantFinderProps) {
  const [user, setUser] = useState<any>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("All");
  const [selectedRating, setSelectedRating] = useState("All");
  const [selectedState, setSelectedState] = useState("All");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedDay, setSelectedDay] = useState("All");
  const [sortBy, setSortBy] = useState("rating");
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [lovedRestaurants, setLovedRestaurants] = useState<Set<string>>(new Set());
  const [savedRestaurants, setSavedRestaurants] = useState<Set<string>>(new Set());
  const [distanceFilter, setDistanceFilter] = useState(0);
  const [openNow, setOpenNow] = useState(false);
  const [loading, setLoading] = useState(true);

  const cuisines = ["All", "Malay", "Chinese", "Indian", "Western", "Japanese", "Korean", "Thai", "Indonesian", "Vietnamese", "Arabic"];
  const priceRanges = ["All", "Budget", "Mid-Range", "Premium"];
  const ratings = ["All", "4", "3", "2", "1"];
  const states = ["All", "Selangor", "Kuala Lumpur", "Penang", "Johor", "Perak", "Sabah", "Sarawak"];
  
  const sortOptions = [
    { value: "rating", label: "Highest Rated" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
    { value: "newest", label: "Newest First" },
    { value: "distance", label: "Nearest First" }
  ];
  const distanceOptions = [
    { value: 0, label: "Any Distance" },
    { value: 1, label: "Within 1 km" },
    { value: 5, label: "Within 5 km" },
    { value: 10, label: "Within 10 km" }
  ];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      await fetchRestaurants();
      if (user) {
        await fetchUserInteractions(user.uid);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const q = query(collection(db, "restaurants"), where("status", "==", "approved"));
      const querySnapshot = await getDocs(q);
      const restaurantsData: Restaurant[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        restaurantsData.push({ 
          id: doc.id, 
          ...data,
          openingDays: data.openingDays || []
        } as Restaurant);
      });
      setRestaurants(restaurantsData);
      setFilteredRestaurants(restaurantsData);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  const fetchUserInteractions = async (userId: string) => {
    try {
      const lovesQuery = query(collection(db, "loves"), where("userId", "==", userId));
      const lovesSnapshot = await getDocs(lovesQuery);
      const lovedSet = new Set<string>();
      lovesSnapshot.forEach((doc) => lovedSet.add(doc.data().restaurantId));
      setLovedRestaurants(lovedSet);

      const savesQuery = query(collection(db, "saves"), where("userId", "==", userId));
      const savesSnapshot = await getDocs(savesQuery);
      const savedSet = new Set<string>();
      savesSnapshot.forEach((doc) => savedSet.add(doc.data().restaurantId));
      setSavedRestaurants(savedSet);
    } catch (error) {
      console.error("Error fetching interactions:", error);
    }
  };

  const handleLove = async (restaurantId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    try {
      if (lovedRestaurants.has(restaurantId)) {
        const loveQuery = query(collection(db, "loves"), where("userId", "==", user.uid), where("restaurantId", "==", restaurantId));
        const snapshot = await getDocs(loveQuery);
        snapshot.forEach(async (doc) => await deleteDoc(doc.ref));
        setLovedRestaurants(prev => {
          const newSet = new Set(prev);
          newSet.delete(restaurantId);
          return newSet;
        });
      } else {
        await addDoc(collection(db, "loves"), {
          userId: user.uid,
          restaurantId: restaurantId,
          createdAt: new Date().toISOString()
        });
        setLovedRestaurants(prev => new Set(prev).add(restaurantId));
      }
    } catch (error) {
      console.error("Error toggling love:", error);
    }
  };

  const handleSave = async (restaurantId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    try {
      if (savedRestaurants.has(restaurantId)) {
        const saveQuery = query(collection(db, "saves"), where("userId", "==", user.uid), where("restaurantId", "==", restaurantId));
        const snapshot = await getDocs(saveQuery);
        snapshot.forEach(async (doc) => await deleteDoc(doc.ref));
        setSavedRestaurants(prev => {
          const newSet = new Set(prev);
          newSet.delete(restaurantId);
          return newSet;
        });
      } else {
        await addDoc(collection(db, "saves"), {
          userId: user.uid,
          restaurantId: restaurantId,
          createdAt: new Date().toISOString()
        });
        setSavedRestaurants(prev => new Set(prev).add(restaurantId));
      }
    } catch (error) {
      console.error("Error toggling save:", error);
    }
  };

  const getCurrentLocation = () => {
    setLocationError("");
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationLoading(false);
        },
        (error) => {
          setLocationError("Unable to get your location. Please enable location access.");
          setLocationLoading(false);
        }
      );
    } else {
      setLocationError("Geolocation not supported by your browser");
      setLocationLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // FIXED: Improved isRestaurantOpen function that handles 24-hour format
  const isRestaurantOpen = (hours: string) => {
    if (!hours) return false;
    
    const hoursLower = hours.toLowerCase().trim();
    
    // Handle 24 hours / 24hrs / 24/7
    if (hoursLower === "24 hours" || 
        hoursLower === "24hrs" || 
        hoursLower === "24/7" ||
        hoursLower.includes("24 hour")) {
      return true;
    }
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Parse time string (supports "9:00 AM", "10PM", "14:30", "02:00 AM")
    const parseTime = (timeStr: string): { hour: number; minute: number } | null => {
      const trimmed = timeStr.trim().toUpperCase();
      
      // 24-hour format (e.g., "14:30" or "22:00")
      const hour24Match = trimmed.match(/^(\d{1,2})(?::(\d{2}))?$/);
      if (hour24Match) {
        let hour = parseInt(hour24Match[1]);
        const minute = hour24Match[2] ? parseInt(hour24Match[2]) : 0;
        if (hour >= 0 && hour <= 23) {
          return { hour, minute };
        }
      }
      
      // 12-hour format with AM/PM (e.g., "9:00 AM", "10PM")
      const ampmMatch = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/);
      if (ampmMatch) {
        let hour = parseInt(ampmMatch[1]);
        const minute = ampmMatch[2] ? parseInt(ampmMatch[2]) : 0;
        const isPM = ampmMatch[3] === "PM";
        
        if (isPM && hour !== 12) hour += 12;
        if (!isPM && hour === 12) hour = 0;
        
        if (hour >= 0 && hour <= 23) {
          return { hour, minute };
        }
      }
      
      return null;
    };
    
    // Split by dash
    const parts = hours.split('-');
    if (parts.length !== 2) return false;
    
    const openTime = parseTime(parts[0]);
    const closeTime = parseTime(parts[1]);
    
    if (!openTime || !closeTime) return false;
    
    const currentTotalMinutes = currentHour * 60 + currentMinute;
    const openTotalMinutes = openTime.hour * 60 + openTime.minute;
    let closeTotalMinutes = closeTime.hour * 60 + closeTime.minute;
    
    // Handle overnight hours (e.g., 10PM - 2AM)
    if (closeTotalMinutes < openTotalMinutes) {
      closeTotalMinutes += 24 * 60;
      const adjustedCurrent = currentTotalMinutes < openTotalMinutes ? currentTotalMinutes + 24 * 60 : currentTotalMinutes;
      return adjustedCurrent >= openTotalMinutes && adjustedCurrent < closeTotalMinutes;
    }
    
    return currentTotalMinutes >= openTotalMinutes && currentTotalMinutes < closeTotalMinutes;
  };

  const isOpenOnDay = (openingDays: string[], day: string) => {
    if (!openingDays || openingDays.length === 0) return true;
    return openingDays.includes(day);
  };

  const applyFilters = () => {
    let filtered = [...restaurants];

    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCuisine !== "All") {
      filtered = filtered.filter(r => r.cuisine === selectedCuisine);
    }

    if (selectedPrice !== "All") {
      filtered = filtered.filter(r => r.priceRange === selectedPrice);
    }

    if (selectedRating !== "All") {
      const minRating = parseInt(selectedRating);
      filtered = filtered.filter(r => (r.rating || 0) >= minRating);
    }

    if (selectedState !== "All") {
      filtered = filtered.filter(r => r.state === selectedState);
    }

    if (selectedArea) {
      filtered = filtered.filter(r => 
        r.area?.toLowerCase().includes(selectedArea.toLowerCase()) ||
        r.address?.toLowerCase().includes(selectedArea.toLowerCase())
      );
    }

    if (selectedDay !== "All") {
      filtered = filtered.filter(r => isOpenOnDay(r.openingDays, selectedDay));
    }

    // FIXED: "Open Now" filter now properly handles 24-hour restaurants
    if (openNow) {
      filtered = filtered.filter(r => isRestaurantOpen(r.hours));
    }

    if (userLocation && distanceFilter > 0) {
      filtered = filtered.filter(r => {
        if (!r.location || (!r.location.lat && !r.location.lng)) return false;
        const dist = calculateDistance(
          userLocation.lat, userLocation.lng,
          r.location.lat || 0, r.location.lng || 0
        );
        return dist <= distanceFilter;
      });
    }

    filtered.sort((a, b) => {
      if (sortBy === "rating") {
        return (b.rating || 0) - (a.rating || 0);
      } else if (sortBy === "price_low") {
        const getPriceValue = (price: string) => {
          if (price.includes("Budget")) return 1;
          if (price.includes("Mid-Range")) return 2;
          if (price.includes("Premium")) return 3;
          return 4;
        };
        return getPriceValue(a.priceRange) - getPriceValue(b.priceRange);
      } else if (sortBy === "price_high") {
        const getPriceValue = (price: string) => {
          if (price.includes("Budget")) return 1;
          if (price.includes("Mid-Range")) return 2;
          if (price.includes("Premium")) return 3;
          return 4;
        };
        return getPriceValue(b.priceRange) - getPriceValue(a.priceRange);
      } else if (sortBy === "newest") {
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      } else if (sortBy === "distance" && userLocation) {
        const distA = calculateDistance(userLocation.lat, userLocation.lng, a.location?.lat || 0, a.location?.lng || 0);
        const distB = calculateDistance(userLocation.lat, userLocation.lng, b.location?.lat || 0, b.location?.lng || 0);
        return distA - distB;
      }
      return 0;
    });

    setFilteredRestaurants(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedCuisine, selectedPrice, selectedRating, selectedState, selectedArea, selectedDay, sortBy, distanceFilter, openNow, userLocation, restaurants]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCuisine("All");
    setSelectedPrice("All");
    setSelectedRating("All");
    setSelectedState("All");
    setSelectedArea("");
    setSelectedDay("All");
    setSortBy("rating");
    setDistanceFilter(0);
    setOpenNow(false);
  };

  const hasActiveFilters = searchTerm !== "" || 
    selectedCuisine !== "All" || 
    selectedPrice !== "All" || 
    selectedRating !== "All" || 
    selectedState !== "All" || 
    selectedArea !== "" || 
    selectedDay !== "All" ||
    distanceFilter > 0 || 
    openNow;

  const getAverageRating = (restaurant: Restaurant) => {
    if (!restaurant.rating || restaurant.rating === 0) return "New";
    return restaurant.rating.toFixed(1);
  };

  const getOpeningDaysDisplay = (openingDays: string[]) => {
    if (!openingDays || openingDays.length === 0) return "Not specified";
    const shortDays = openingDays.map(day => day.slice(0, 3)).join(", ");
    return shortDays;
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
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Find Restaurants</h1>
        <button
          onClick={getCurrentLocation}
          disabled={locationLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Navigation className="w-4 h-4" />
          {locationLoading ? "Getting location..." : "Use My Location"}
        </button>
      </div>

      {userLocation && distanceFilter > 0 && (
        <div className="bg-green-50 rounded-lg p-3 mb-4 text-green-800 text-sm border border-green-200">
          📍 Showing restaurants within {distanceFilter} km of your location.
        </div>
      )}

      {locationError && (
        <div className="bg-red-50 rounded-lg p-3 mb-4 text-red-800 text-sm">
          ❌ {locationError}
        </div>
      )}

      {userLocation && distanceFilter === 0 && (
        <div className="bg-blue-50 rounded-lg p-3 mb-4 text-blue-800 text-sm border border-blue-200">
          📍 Location detected! Use the distance filter to show nearby restaurants.
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-4 mb-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by restaurant or cuisine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 w-2 h-2 bg-blue-600 rounded-full"></span>
            )}
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700 bg-white"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Utensils className="w-4 h-4 inline mr-1" />
                  Cuisine Type
                </label>
                <select
                  value={selectedCuisine}
                  onChange={(e) => setSelectedCuisine(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                >
                  {cuisines.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Price Range
                </label>
                <select
                  value={selectedPrice}
                  onChange={(e) => setSelectedPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                >
                  {priceRanges.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Star className="w-4 h-4 inline mr-1" />
                  Minimum Rating
                </label>
                <select
                  value={selectedRating}
                  onChange={(e) => setSelectedRating(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                >
                  {ratings.map(r => <option key={r} value={r}>{r === "All" ? r : `${r}+ Stars`}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  State
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                >
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Area
                </label>
                <input
                  type="text"
                  placeholder="e.g., Bukit Bintang"
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Open On
                </label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                >
                  <option value="All">Any Day</option>
                  {daysOfWeek.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distance
                </label>
                <select
                  value={distanceFilter}
                  onChange={(e) => setDistanceFilter(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  disabled={!userLocation}
                >
                  {distanceOptions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
                {!userLocation && (
                  <p className="text-xs text-red-500 mt-1">Click "Use My Location" first</p>
                )}
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={openNow}
                    onChange={(e) => setOpenNow(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Open Now</span>
                </label>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <X className="w-3 h-3" />
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-500">
          Found {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''}
        </p>
      </div>

      {filteredRestaurants.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No restaurants found. Try adjusting your filters.</p>
          <button
            onClick={clearAllFilters}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant, idx) => (
            <div
              key={restaurant.id}
              onClick={() => { setSelectedRestaurant(restaurant); setCurrentPage("restaurantDetails"); }}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border border-gray-100"
            >
              <div className="relative h-48">
                <img
                  src={restaurant.images?.[0] || "https://placehold.co/400x300/e2e8f0/475569?text=No+Image"}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-lg text-sm font-semibold">
                  {restaurant.estimatedCost}
                </div>
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <button onClick={(e) => handleLove(restaurant.id, e)} className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:scale-110 transition">
                    <Heart className={`w-5 h-5 ${lovedRestaurants.has(restaurant.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                  </button>
                  <button onClick={(e) => handleSave(restaurant.id, e)} className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:scale-110 transition">
                    <Bookmark className={`w-5 h-5 ${savedRestaurants.has(restaurant.id) ? 'fill-blue-500 text-blue-500' : 'text-gray-600'}`} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{restaurant.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-semibold text-gray-800">{getAverageRating(restaurant)}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-2">{restaurant.cuisine} • {restaurant.priceRange}</p>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{restaurant.address}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-xs mb-3">
                  <Calendar className="w-3 h-3" />
                  <span>Open: {getOpeningDaysDisplay(restaurant.openingDays)}</span>
                </div>
                {restaurant.hours && (
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                    <Clock className="w-3 h-3" />
                    <span>{restaurant.hours}</span>
                  </div>
                )}
                <button className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}