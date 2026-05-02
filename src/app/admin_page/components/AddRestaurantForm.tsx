"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { uploadMultipleToCloudinary } from "@/lib/cloudinary";
import { Plus, X, Save, Loader2, Image as ImageIcon } from "lucide-react";

interface AddRestaurantFormProps {
  user: any;
  onRefresh: () => void;
}

const cuisines = ["Malay", "Chinese", "Indian", "Western", "Japanese", "Korean", "Thai", "Indonesian", "Other"];
const priceRanges = ["Budget", "Mid-Range", "Premium"];

export default function AddRestaurantForm({ user, onRefresh }: AddRestaurantFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    name: "",
    cuisine: "",
    priceRange: "Budget",
    estimatedCost: "",
    address: "",
    lat: "",
    lng: "",
    description: "",
    phone: "",
    hours: "",
    imageFiles: [] as File[],
    imageUrls: [] as string[]
  });

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    const newFiles = [...formData.imageFiles];
    const newUrls = [...formData.imageUrls];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "Image must be less than 5MB" });
        continue;
      }
      newFiles.push(file);
      newUrls.push(URL.createObjectURL(file));
    }
    setFormData({ ...formData, imageFiles: newFiles, imageUrls: newUrls });
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_: string, i: number) => i !== index),
      imageFiles: formData.imageFiles.filter((_: File, i: number) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setMessage({ type: "", text: "" });

    // Validation
    if (!formData.name.trim()) {
      setMessage({ type: "error", text: "Please enter restaurant name" });
      setUploading(false);
      return;
    }
    if (!formData.cuisine) {
      setMessage({ type: "error", text: "Please select cuisine" });
      setUploading(false);
      return;
    }
    if (!formData.estimatedCost.trim()) {
      setMessage({ type: "error", text: "Please enter estimated cost" });
      setUploading(false);
      return;
    }
    if (!formData.address.trim()) {
      setMessage({ type: "error", text: "Please enter address" });
      setUploading(false);
      return;
    }

    try {
      let imageUrls: string[] = [];
      if (formData.imageFiles.length > 0) {
        try {
          imageUrls = await uploadMultipleToCloudinary(formData.imageFiles);
          console.log("Images uploaded:", imageUrls);
        } catch (uploadError) {
          console.error("Upload error:", uploadError);
          setMessage({ type: "error", text: "Failed to upload images. Please try again." });
          setUploading(false);
          return;
        }
      }

      const restaurantData = {
        name: formData.name.trim(),
        cuisine: formData.cuisine,
        priceRange: formData.priceRange,
        estimatedCost: formData.estimatedCost.trim(),
        address: formData.address.trim(),
        location: {
          lat: parseFloat(formData.lat) || 0,
          lng: parseFloat(formData.lng) || 0
        },
        description: formData.description.trim() || "",
        phone: formData.phone.trim() || "",
        hours: formData.hours.trim() || "",
        images: imageUrls,
        rating: 0,
        totalReviews: 0,
        status: "pending",
        submittedBy: user?.uid,
        submittedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log("Submitting restaurant data:", restaurantData);
      
      const docRef = await addDoc(collection(db, "restaurants"), restaurantData);
      console.log("Restaurant added with ID:", docRef.id);

      setMessage({ type: "success", text: "✅ Restaurant added successfully! Pending approval." });
      
      // Reset form
      setFormData({
        name: "", cuisine: "", priceRange: "Budget", estimatedCost: "", address: "",
        lat: "", lng: "", description: "", phone: "", hours: "", imageFiles: [], imageUrls: []
      });
      
      // Close form after 2 seconds
      setTimeout(() => {
        setShowForm(false);
        onRefresh(); // Refresh the restaurant list
      }, 2000);
      
    } catch (error: any) {
      console.error("Error saving restaurant:", error);
      setMessage({ type: "error", text: `❌ Failed to save: ${error.message}` });
    } finally {
      setUploading(false);
    }
  };

  if (!showForm) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <button 
          onClick={() => setShowForm(true)} 
          className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
        >
          <Plus className="w-4 h-4 inline mr-2" /> Click to Add New Restaurant
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Add New Restaurant</h2>
        <button 
          onClick={() => setShowForm(false)} 
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {message.text && (
        <div className={`mb-4 p-3 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name *</label>
            <input 
              type="text" 
              required 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              placeholder="e.g., Nasi Kandar Pelita"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine *</label>
            <select 
              required 
              value={formData.cuisine} 
              onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="">Select Cuisine</option>
              {cuisines.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price Range *</label>
            <select 
              required 
              value={formData.priceRange} 
              onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              {priceRanges.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost * (e.g., RM 10-20)</label>
            <input 
              type="text" 
              required 
              placeholder="RM 10-20" 
              value={formData.estimatedCost} 
              onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <input 
              type="text" 
              required 
              value={formData.address} 
              onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              placeholder="e.g., Jalan Ampang, Kuala Lumpur"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude (Optional)</label>
            <input 
              type="text" 
              placeholder="3.1390" 
              value={formData.lat} 
              onChange={(e) => setFormData({ ...formData, lat: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
            <p className="text-xs text-gray-500 mt-1">Get from Google Maps</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude (Optional)</label>
            <input 
              type="text" 
              placeholder="101.6869" 
              value={formData.lng} 
              onChange={(e) => setFormData({ ...formData, lng: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
            <p className="text-xs text-gray-500 mt-1">Get from Google Maps</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input 
              type="tel" 
              value={formData.phone} 
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              placeholder="e.g., +60 12-345 6789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Operating Hours</label>
            <input 
              type="text" 
              placeholder="10AM - 10PM" 
              value={formData.hours} 
              onChange={(e) => setFormData({ ...formData, hours: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              rows={3} 
              value={formData.description} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              placeholder="Describe the restaurant, specialty dishes, atmosphere, etc."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Images</label>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Select Images
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e.target.files)} 
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500">Max 5MB per image</p>
            </div>
            
            {formData.imageUrls.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {formData.imageUrls.map((url: string, i: number) => (
                  <div key={i} className="relative">
                    <img 
                      src={url} 
                      alt="Preview" 
                      className="w-full h-20 object-cover rounded-lg border border-gray-300"
                    />
                    <button 
                      type="button" 
                      onClick={() => removeImage(i)} 
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-3 pt-4">
          <button 
            type="submit" 
            disabled={uploading} 
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold transition-colors"
          >
            {uploading ? (
              <><Loader2 className="w-4 h-4 inline animate-spin mr-2" />Saving...</>
            ) : (
              <><Save className="w-4 h-4 inline mr-2" />Add Restaurant</>
            )}
          </button>
          <button 
            type="button" 
            onClick={() => setShowForm(false)} 
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}