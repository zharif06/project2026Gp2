"use client";

import { MapPin, DollarSign, Star, Utensils } from "lucide-react";

type PageType = "home" | "profile" | "editProfile" | "changePassword" | "about" | "contact" | "restaurants" | "restaurantDetails" | "reviews";

interface HomepageProps {
  setCurrentPage: (page: PageType) => void;
}

export default function Homepage({ setCurrentPage }: HomepageProps) {
  return (
    <div className="text-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
        <h1 className="text-4xl font-bold mb-4">Find Your Perfect Meal</h1>
        <p className="text-lg mb-6 text-white/90">Discover restaurants that fit your budget</p>
        <button 
          onClick={() => setCurrentPage("restaurants")}
          className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Start Exploring
        </button>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <MapPin className="w-12 h-12 text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nearby Restaurants</h3>
          <p className="text-gray-600">Find restaurants close to your location</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <DollarSign className="w-12 h-12 text-green-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Budget Friendly</h3>
          <p className="text-gray-600">Filter by price range to match your budget</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <Star className="w-12 h-12 text-yellow-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Reviews</h3>
          <p className="text-gray-600">Read real reviews from other customers</p>
        </div>
      </div>

      {/* Popular Cuisines */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Popular Cuisines</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["Malay", "Chinese", "Indian", "Western", "Japanese", "Korean", "Thai", "Indonesian"].map((cuisine) => (
            <button
              key={cuisine}
              onClick={() => setCurrentPage("restaurants")}
              className="bg-white p-4 rounded-xl shadow-md border border-gray-100 text-center hover:shadow-lg transition-shadow"
            >
              <Utensils className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <span className="font-medium text-gray-800">{cuisine}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}