// src/app/admin_page/components/EditRestaurantModal.tsx
"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { uploadMultipleToCloudinary } from "@/lib/cloudinary";
import { X, Save, Loader2 } from "lucide-react";

interface EditRestaurantModalProps {
  restaurant: any;
  onClose: () => void;
  onRefresh: () => void;
}

const cuisines = ["Malay", "Chinese", "Indian", "Western", "Japanese", "Korean", "Thai", "Indonesian", "Other"];
const priceRanges = ["Budget", "Mid-Range", "Premium"];

export default function EditRestaurantModal({ restaurant, onClose, onRefresh }: EditRestaurantModalProps) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    priceRange: restaurant.priceRange,
    estimatedCost: restaurant.estimatedCost,
    address: restaurant.address,
    lat: restaurant.location?.lat?.toString() || "",
    lng: restaurant.location?.lng?.toString() || "",
    description: restaurant.description || "",
    phone: restaurant.phone || "",
    hours: restaurant.hours || "",
    imageFiles: [] as File[],
    imageUrls: restaurant.images || []
  });

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    const newFiles = [...formData.imageFiles];
    const newUrls = [...formData.imageUrls];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) continue;
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
    try {
      let imageUrls = formData.imageUrls;
      if (formData.imageFiles.length > 0) {
        const newUrls = await uploadMultipleToCloudinary(formData.imageFiles);
        imageUrls = [...formData.imageUrls, ...newUrls];
      }

      await updateDoc(doc(db, "restaurants", restaurant.id), {
        name: formData.name,
        cuisine: formData.cuisine,
        priceRange: formData.priceRange,
        estimatedCost: formData.estimatedCost,
        address: formData.address,
        location: { lat: parseFloat(formData.lat) || 0, lng: parseFloat(formData.lng) || 0 },
        description: formData.description,
        phone: formData.phone,
        hours: formData.hours,
        images: imageUrls,
        updatedAt: new Date().toISOString()
      });

      setMessage("✅ Updated successfully!");
      setTimeout(() => { onRefresh(); onClose(); }, 1500);
    } catch (error) {
      setMessage("❌ Failed to update");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Edit Restaurant</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {message && (
            <div className={`p-3 rounded-lg ${message.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {message}
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name *</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine *</label>
              <select required value={formData.cuisine} onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white">
                {cuisines.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Range *</label>
              <select required value={formData.priceRange} onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white">
                {priceRanges.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost *</label>
              <input type="text" required value={formData.estimatedCost} onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
              <input type="text" required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input type="text" placeholder="3.1390" value={formData.lat} onChange={(e) => setFormData({ ...formData, lat: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input type="text" placeholder="101.6869" value={formData.lng} onChange={(e) => setFormData({ ...formData, lng: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
              <input type="text" placeholder="10AM - 10PM" value={formData.hours} onChange={(e) => setFormData({ ...formData, hours: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
              <input type="file" multiple accept="image/*" onChange={(e) => handleImageUpload(e.target.files)} className="w-full px-3 py-2 border rounded-lg" />
              {formData.imageUrls.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {formData.imageUrls.map((url: string, i: number) => (
                    <div key={i} className="relative">
                      <img src={url} alt="Preview" className="w-full h-20 object-cover rounded-lg" />
                      <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={uploading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold">
              {uploading ? <><Loader2 className="w-4 h-4 inline animate-spin mr-2" />Saving...</> : <><Save className="w-4 h-4 inline mr-2" />Update Restaurant</>}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}