"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Clock,
  Star,
  MapPin,
  DollarSign,
  Plus,
  Utensils,
  Calendar
} from "lucide-react";
import AddEditRestaurantModal from "./AddEditRestaurantModal";

interface RestaurantsManagementProps {
  restaurants: any[];
  currentUser: any;
  onRefresh: () => void;
}

export default function RestaurantsManagement({ restaurants, currentUser, onRefresh }: RestaurantsManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleApprove = async (id: string) => {
    try {
      await updateDoc(doc(db, "restaurants", id), { 
        status: "approved",
        approvedAt: new Date().toISOString()
      });
      setMessage({ type: "success", text: "✅ Restaurant approved!" });
      onRefresh();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "❌ Failed to approve" });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateDoc(doc(db, "restaurants", id), { status: "rejected" });
      setMessage({ type: "success", text: "❌ Restaurant rejected!" });
      onRefresh();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "❌ Failed to reject" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this restaurant permanently? This action cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "restaurants", id));
      setMessage({ type: "success", text: "🗑️ Restaurant deleted!" });
      onRefresh();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "❌ Failed to delete" });
    }
  };

  const filteredRestaurants = restaurants.filter((restaurant: any) => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || restaurant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "approved":
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Approved</span>;
      case "rejected":
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>;
      default:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
    }
  };

  const getOpeningDaysDisplay = (openingDays: string[]) => {
    if (!openingDays || openingDays.length === 0) return "Not specified";
    const shortDays = openingDays.map(day => day.slice(0, 3)).join(", ");
    return shortDays;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Restaurant Management</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Manage all restaurant listings, approve or reject submissions</p>
        </div>
        <button 
          onClick={() => {
            setSelectedRestaurant(null);
            setShowEditModal(true);
          }} 
          className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Add Restaurant
        </button>
      </div>

      {message.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message.text}
        </div>
      )}

      {/* Filters - Mobile Responsive */}
      <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or cuisine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white text-sm sm:text-base"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 sm:px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-700 bg-white text-sm sm:text-base"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Restaurant Cards Grid - Mobile Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {filteredRestaurants.map((restaurant: any) => (
          <div key={restaurant.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="relative h-40 sm:h-48">
              <img 
                src={restaurant.images?.[0] || "https://placehold.co/400x300/e2e8f0/475569?text=No+Image"} 
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                {getStatusBadge(restaurant.status)}
              </div>
              <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg">
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                  <span className="text-white text-sm font-semibold">
  {restaurant.rating && restaurant.rating > 0 ? restaurant.rating.toFixed(1) : "New"}
</span>
                </div>
              </div>
            </div>
            <div className="p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-800">{restaurant.name}</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-2">{restaurant.cuisine} • {restaurant.priceRange}</p>
              <div className="flex items-center gap-2 text-gray-500 text-xs sm:text-sm mb-2 sm:mb-3">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{restaurant.address}</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-2 sm:mb-3">
                <Calendar className="w-3 h-3" />
                <span>Open: {getOpeningDaysDisplay(restaurant.openingDays)}</span>
              </div>
              
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                <span className="text-xs sm:text-sm font-semibold text-gray-700">{restaurant.estimatedCost}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 sm:mt-3">
                {restaurant.status === "pending" && (
                  <>
                    <button onClick={() => handleApprove(restaurant.id)} className="flex-1 bg-green-600 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-green-700 text-xs sm:text-sm font-medium">Approve</button>
                    <button onClick={() => handleReject(restaurant.id)} className="flex-1 bg-red-600 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-red-700 text-xs sm:text-sm font-medium">Reject</button>
                  </>
                )}
                <button onClick={() => { setSelectedRestaurant(restaurant); setShowEditModal(true); }} className="flex-1 bg-blue-600 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-blue-700 text-xs sm:text-sm font-medium">
                  <Edit className="w-3 h-3 sm:w-4 sm:h-4 inline mr-0 sm:mr-1" /> Edit
                </button>
                <button onClick={() => handleDelete(restaurant.id)} className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 text-red-600 rounded-lg hover:bg-red-50 text-xs sm:text-sm font-medium">
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRestaurants.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center">
          <Utensils className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No restaurants found</p>
        </div>
      )}

      {showEditModal && (
        <AddEditRestaurantModal 
          restaurant={selectedRestaurant}
          onClose={() => setShowEditModal(false)} 
          onRefresh={onRefresh}
          user={currentUser}
        />
      )}
    </div>
  );
}
