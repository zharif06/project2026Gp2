"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { CheckCircle, XCircle, Edit, Trash2, MapPin, DollarSign } from "lucide-react";
import EditRestaurantModal from "./EditRestaurantModal";

interface PendingRestaurantsProps {
  restaurants: any[];
  onRefresh: () => void;
  user: any;
}

export default function PendingRestaurants({ restaurants, onRefresh, user }: PendingRestaurantsProps) {
  const [message, setMessage] = useState({ type: "", text: "" });
  const [editingRestaurant, setEditingRestaurant] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleApprove = async (id: string) => {
    try {
      await updateDoc(doc(db, "restaurants", id), { status: "approved", approvedBy: user?.uid, approvedAt: new Date().toISOString() });
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
      setMessage({ type: "success", text: "✅ Restaurant rejected!" });
      onRefresh();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "❌ Failed to reject" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this restaurant permanently?")) return;
    try {
      await deleteDoc(doc(db, "restaurants", id));
      setMessage({ type: "success", text: "✅ Deleted!" });
      onRefresh();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "❌ Failed to delete" });
    }
  };

  const getStatusBadge = () => (
    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">Pending</span>
  );

  if (restaurants.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <p className="text-gray-500">No pending restaurants to approve</p>
      </div>
    );
  }

  return (
    <div>
      {message.text && (
        <div className={`mb-4 p-3 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message.text}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <div key={restaurant.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="relative h-48">
              <img src={restaurant.images?.[0] || "https://placehold.co/400x300"} alt={restaurant.name} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2">{getStatusBadge()}</div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900">{restaurant.name}</h3>
              <p className="text-gray-600 text-sm">{restaurant.cuisine} • {restaurant.priceRange}</p>
              <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{restaurant.address}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold">{restaurant.estimatedCost}</span>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => handleApprove(restaurant.id)} className="flex-1 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 text-sm">Approve</button>
                <button onClick={() => handleReject(restaurant.id)} className="flex-1 bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 text-sm">Reject</button>
                <button onClick={() => { setEditingRestaurant(restaurant); setShowEditModal(true); }} className="px-3 py-1.5 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(restaurant.id)} className="px-3 py-1.5 border border-red-600 text-red-600 rounded-lg hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showEditModal && editingRestaurant && (
        <EditRestaurantModal 
          restaurant={editingRestaurant} 
          onClose={() => setShowEditModal(false)} 
          onRefresh={onRefresh} 
        />
      )}
    </div>
  );
}