import React, { useState, useEffect, useRef } from 'react'; // 👈 useRef add kiya
import { useDispatch } from 'react-redux';
import { fetchShopDashboardData } from '../../features/user/shopMenu.slice.js'; 
import axios from 'axios';
import toast from 'react-hot-toast'; 

function CreateShopForm() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  
  // 🔒 Anti-Double Toast Lock (Using useRef taake re-render par state reset na ho)
  const isToastLocked = useRef(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisineType: '',
    address: '',
    longitude: '74.1883', 
    latitude: '32.1617'
  });
  const [banner, setBanner] = useState(null);

  // 📍 Automatically pick live location of the Shop Owner
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            longitude: longitude.toString(),
            latitude: latitude.toString()
          }));
          console.log(`Owner Location Detected: Lat ${latitude}, Lng ${longitude}`);
        },
        (error) => {
          console.warn("Location permission denied. Using default fallback coordinates.");
        }
      );
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setBanner(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.cuisineType || !formData.address || !banner) {
      return toast.error("Please fill all required fields and upload a banner image.");
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("cuisineType", formData.cuisineType);
    data.append("address", formData.address);
    data.append("longitude", formData.longitude);
    data.append("latitude", formData.latitude);
    data.append("banner", banner); 

    try {
      setLoading(true);
      
      const response = await axios.post('/api/v1/shop/shop-register', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data?.success) {
        // 🛑 Check karo agar lock lag chuka hai toh doosre wale ko block kar do
        if (!isToastLocked.current) {
          isToastLocked.current = true; // Lock lagao
          toast.dismiss(); 
          toast.success("Shop registered successfully!");
        }
        
        setTimeout(() => {
          dispatch(fetchShopDashboardData());
          // Redirect ya data fetch hone ke baad lock open karne ki zaroorat nahi kyunke state change ho jayegi
        }, 1200);
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.dismiss();
      toast.error(error.response?.data?.message || "Failed to register shop.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full text-left space-y-4 max-w-md mx-auto bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Shop Name *</label>
        <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., Savour Foods" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 mt-1 outline-none focus:border-[#ff4d2d]" required />
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
        <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Describe your kitchen taste..." rows="2" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 mt-1 outline-none focus:border-[#ff4d2d] resize-none" />
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Cuisines (Comma Separated) *</label>
        <input type="text" name="cuisineType" value={formData.cuisineType} onChange={handleInputChange} placeholder="e.g., Desi, Fast Food, Chinese" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 mt-1 outline-none focus:border-[#ff4d2d]" required />
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Physical Address *</label>
        <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="e.g., Main Market, Block C, Gujranwala" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 mt-1 outline-none focus:border-[#ff4d2d]" required />
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Shop Banner Image *</label>
        <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-xs text-gray-500 mt-1 cursor-pointer" required />
      </div>

      <button type="submit" disabled={loading} className="w-full bg-[#ff4d2d] text-white font-bold py-2.5 rounded-xl transition-all active:scale-95 text-sm cursor-pointer disabled:bg-orange-300">
        {loading ? "Activating Storefront..." : "Launch Storefront"}
      </button>
    </form>
  );
}

export default CreateShopForm;