"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, addDoc, collection } from "firebase/firestore";
import { uploadMultipleToCloudinary } from "@/lib/cloudinary";
import { X, Save, Loader2, Plus, Globe, MapPin, Phone, Clock, Utensils } from "lucide-react";

interface AddEditRestaurantModalProps {
  restaurant?: any;
  user: any;
  onClose: () => void;
  onRefresh: () => void;
}

const cuisines = ["Malay", "Chinese", "Indian", "Western", "Japanese", "Korean", "Thai", "Indonesian", "Vietnamese", "Arabic", "Other"];
const priceRanges = ["Budget (RM 1-20)", "Mid-Range (RM 20-50)", "Premium (RM 50-100)", "Luxury (RM 100+)"];
const states = ["Selangor", "Kuala Lumpur", "Penang", "Johor", "Perak", "Perlis", "Kedah", "Kelantan", "Terengganu", "Pahang", "Melaka", "Negeri Sembilan", "Sabah", "Sarawak", "Labuan", "Putrajaya"];

// Helper to extract open/close times from hours string
const parseHoursToOpenClose = (hours: string) => {
  if (!hours) return { openTime: "09:00", closeTime: "22:00", is24Hours: false };
  
  // Check if it's 24 hours
  if (hours.toLowerCase().includes("24 hours") || hours.toLowerCase().includes("24hrs")) {
    return { openTime: "00:00", closeTime: "23:59", is24Hours: true };
  }
  
  // Try to parse "HH:MM AM/PM - HH:MM AM/PM" format
  const match = hours.match(/(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)\s*-\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)/i);
  if (match) {
    return { openTime: match[1].trim(), closeTime: match[2].trim(), is24Hours: false };
  }
  
  return { openTime: "09:00", closeTime: "22:00", is24Hours: false };
};

// Helper to combine open/close times into hours string
const combineToHoursString = (openTime: string, closeTime: string, is24Hours: boolean) => {
  if (is24Hours) return "24 Hours";
  return `${openTime} - ${closeTime}`;
};

export default function AddEditRestaurantModal({ restaurant, user, onClose, onRefresh }: AddEditRestaurantModalProps) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [newMenuItem, setNewMenuItem] = useState("");
  
  // Parse existing hours into open/close times
  const existingHours = parseHoursToOpenClose(restaurant?.hours || "");
  
  const [formData, setFormData] = useState({
    name: restaurant?.name || "",
    cuisine: restaurant?.cuisine || "",
    priceRange: restaurant?.priceRange || "Budget (RM 1-20)",
    estimatedCost: restaurant?.estimatedCost || "",
    address: restaurant?.address || "",
    state: restaurant?.state || "Kuala Lumpur",
    area: restaurant?.area || "",
    lat: restaurant?.location?.lat?.toString() || "",
    lng: restaurant?.location?.lng?.toString() || "",
    description: restaurant?.description || "",
    phone: restaurant?.phone || "",
    openTime: existingHours.openTime,
    closeTime: existingHours.closeTime,
    is24Hours: existingHours.is24Hours,
    openingDays: restaurant?.openingDays || [],
    website: restaurant?.website || "",
    direction: restaurant?.direction || "",
    menu: restaurant?.menu || [],
    imageFiles: [] as File[],
    imageUrls: restaurant?.images || []
  });

  const addMenuItem = () => {
    if (newMenuItem.trim()) {
      setFormData({ ...formData, menu: [...formData.menu, newMenuItem.trim()] });
      setNewMenuItem("");
    }
  };

  const removeMenuItem = (index: number) => {
    setFormData({ ...formData, menu: formData.menu.filter((_: string, i: number) => i !== index) });
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    const newFiles = [...formData.imageFiles];
    const newUrls = [...formData.imageUrls];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        setMessage("Image must be less than 5MB");
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
      imageUrls: formData.imageUrls.filter((_url: string, i: number) => i !== index),
      imageFiles: formData.imageFiles.filter((_: File, i: number) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setMessage("");

    if (!formData.name || !formData.cuisine || !formData.estimatedCost || !formData.address) {
      setMessage("Please fill in all required fields (*)");
      setUploading(false);
      return;
    }

    try {
      let imageUrls = formData.imageUrls;
      if (formData.imageFiles.length > 0) {
        imageUrls = await uploadMultipleToCloudinary(formData.imageFiles);
      }

      // Combine open/close times into hours string
      const hoursString = combineToHoursString(formData.openTime, formData.closeTime, formData.is24Hours);

      const restaurantData = {
        name: formData.name.trim(),
        cuisine: formData.cuisine,
        priceRange: formData.priceRange,
        estimatedCost: formData.estimatedCost.trim(),
        address: formData.address.trim(),
        state: formData.state,
        area: formData.area,
        location: {
          lat: parseFloat(formData.lat) || 0,
          lng: parseFloat(formData.lng) || 0
        },
        description: formData.description.trim() || "",
        phone: formData.phone.trim() || "",
        hours: hoursString,
        openingDays: formData.openingDays,
        website: formData.website.trim() || "",
        direction: formData.direction.trim() || "",
        menu: formData.menu,
        images: imageUrls,
        rating: restaurant?.rating || 0,
        totalReviews: restaurant?.totalReviews || 0,
        status: restaurant?.status || "pending",
        submittedBy: restaurant?.submittedBy || user?.uid,
        submittedAt: restaurant?.submittedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (restaurant) {
        await updateDoc(doc(db, "restaurants", restaurant.id), restaurantData);
        setMessage("✅ Restaurant updated successfully!");
      } else {
        await addDoc(collection(db, "restaurants"), restaurantData);
        setMessage("✅ Restaurant submitted for approval!");
      }

      setTimeout(() => {
        onRefresh();
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error("Error saving restaurant:", error);
      setMessage(`❌ Failed to save: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-white" />
            <h3 className="text-xl font-bold text-white">
              {restaurant ? "Edit Restaurant" : "Add New Restaurant"}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {message && (
            <div className={`p-3 rounded-lg ${message.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {message}
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">📋 Basic Information</h4>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Restaurant Name *</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white" placeholder="e.g., Nasi Kandar Pelita" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Cuisine *</label>
              <select required value={formData.cuisine} onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white">
                <option value="">Select Cuisine</option>
                {cuisines.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Price Range *</label>
              <select required value={formData.priceRange} onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white">
                {priceRanges.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Estimated Cost *</label>
              <input type="text" required placeholder="RM 10-20" value={formData.estimatedCost} onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white" />
            </div>
            
            {/* Location */}
            <div className="md:col-span-2">
              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2 mt-2">📍 Location</h4>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-800 mb-1">Address *</label>
              <input type="text" required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">State</label>
              <select value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white">
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Area</label>
              <input type="text" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white" placeholder="e.g., Bukit Bintang" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Latitude</label>
              <input type="text" placeholder="3.1390" value={formData.lat} onChange={(e) => setFormData({ ...formData, lat: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Longitude</label>
              <input type="text" placeholder="101.6869" value={formData.lng} onChange={(e) => setFormData({ ...formData, lng: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white" />
            </div>
            
            {/* Contact & Web */}
            <div className="md:col-span-2">
              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2 mt-2">📞 Contact & Online</h4>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Phone Number</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white" placeholder="+60 12-345 6789" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Website</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white" placeholder="https://..." />
              </div>
            </div>
            
            {/* NEW: Operating Hours with Open Time & Close Time */}
            <div className="md:col-span-2">
              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2 mt-2">🕐 Operating Hours</h4>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is24Hours}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      is24Hours: e.target.checked,
                      openTime: e.target.checked ? "00:00" : "09:00",
                      closeTime: e.target.checked ? "23:59" : "22:00"
                    });
                  }}
                  className="w-4 h-4 text-orange-500 rounded"
                />
                <span className="text-sm font-medium text-gray-700">24 Hours (Open all day)</span>
              </label>
            </div>

            {!formData.is24Hours && (
              <div className="grid grid-cols-2 gap-4 md:col-span-2">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Open Time *</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      required={!formData.is24Hours}
                      placeholder="9:00 AM"
                      value={formData.openTime}
                      onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Examples: 9:00 AM, 10AM, 08:30, 14:00</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Close Time *</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      required={!formData.is24Hours}
                      placeholder="10:00 PM"
                      value={formData.closeTime}
                      onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Examples: 10:00 PM, 10PM, 22:00, 02:00 (next day)</p>
                </div>
              </div>
            )}

            {/* Opening Days */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-800 mb-1">Opening Days</label>
              <div className="grid grid-cols-3 gap-2">
                {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map((day) => (
                  <label key={day} className="flex items-center gap-2 text-gray-700 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.openingDays.includes(day)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            openingDays: [...formData.openingDays, day],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            openingDays: formData.openingDays.filter((d: string) => d !== day),
                          });
                        }
                      }}
                    />
                    {day}
                  </label>
                ))}
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-800 mb-1">Google Maps Direction Link</label>
              <input type="text" value={formData.direction} onChange={(e) => setFormData({ ...formData, direction: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white" placeholder="https://maps.google.com/..." />
            </div>
            
            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-800 mb-1">Description</label>
              <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white" placeholder="Describe the restaurant, specialty dishes, atmosphere..." />
            </div>
            
            {/* Menu Items */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-800 mb-1">Menu Items</label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={newMenuItem} onChange={(e) => setNewMenuItem(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white" placeholder="e.g., Nasi Lemak - RM 8" />
                <button type="button" onClick={addMenuItem} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.menu.map((item: string, index: number) => (
                  <div key={index} className="bg-gray-100 rounded-lg px-3 py-1 flex items-center gap-2">
                    <span className="text-sm text-gray-700">{item}</span>
                    <button type="button" onClick={() => removeMenuItem(index)} className="text-red-500 hover:text-red-700">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Images */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-800 mb-1">Restaurant Images</label>
              <label className="cursor-pointer bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all inline-flex items-center gap-2">
                <Plus className="w-4 h-4" /> Upload Images
                <input type="file" multiple accept="image/*" onChange={(e) => handleImageUpload(e.target.files)} className="hidden" />
              </label>
              <p className="text-xs text-gray-500 mt-1">Max 5MB per image. Upload up to 5 images</p>
              
              {formData.imageUrls.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {formData.imageUrls.map((url: string, i: number) => (
                    <div key={i} className="relative">
                      <img src={url} alt="Preview" className="w-full h-20 object-cover rounded-lg border border-gray-300" />
                      <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-3 pt-4 border-t">
            <button type="submit" disabled={uploading} className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-lg hover:shadow-lg disabled:opacity-50 font-semibold transition-all">
              {uploading ? <><Loader2 className="w-4 h-4 inline animate-spin mr-2" />Saving...</> : <><Save className="w-4 h-4 inline mr-2" />{restaurant ? "Update Restaurant" : "Submit for Approval"}</>}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}