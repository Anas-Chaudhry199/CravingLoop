import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom'; 
import { updateShopDetailsThunk, updateShopBannerThunk, deleteShopThunk, fetchShopDashboardData } from '../../features/user/shopMenu.slice'; 
import toast from 'react-hot-toast';
import axios from 'axios'; 
import { FiSave, FiGrid, FiUploadCloud, FiTrash2, FiChevronDown, FiRefreshCw } from "react-icons/fi"; 

function EditShopDetails() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [allShops, setAllShops] = useState([]); 
  const [selectedShopId, setSelectedShopId] = useState(searchParams.get('shopId') || ''); 

  // 🟢 State selector se loading nikali
  const { shopInfo, loading } = useSelector((state) => state.shopMenu);

  // Local state loader taake background sync par screen lock na ho
  const [localFetchLoading, setLocalFetchLoading] = useState(false);

  // 🚨 INFINITE LOOP BREAKER
  const lastFetchedIdRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    cuisineType: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // PIPELINE A: All owner shops pool
  useEffect(() => {
    const fetchOwnerShops = async () => {
      try {
        const response = await axios.get('/api/v1/shop/get-all-owner-shops', { withCredentials: true });
        if (response.data?.data) {
          setAllShops(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch owner shops pool:", error);
      }
    };
    fetchOwnerShops();
  }, []);

  const currentUrlShopId = searchParams.get('shopId') || '';

  // 🟢 FIXED GATEKEEPER EFFECT
  useEffect(() => {
    const loadData = async () => {
      if (currentUrlShopId && currentUrlShopId !== lastFetchedIdRef.current) {
        lastFetchedIdRef.current = currentUrlShopId; 
        setSelectedShopId(currentUrlShopId);
        
        setLocalFetchLoading(true); // Sync start
        try {
          // unwrap() use kiya taake catch block lazmi hit ho agar fail ho
          await dispatch(fetchShopDashboardData(currentUrlShopId)).unwrap(); 
        } catch (err) {
          console.error("Sync pipeline stalled: ", err);
        } finally {
          setLocalFetchLoading(false); // Har haal mein loader band hoga
        }
      } else if (!currentUrlShopId) {
        lastFetchedIdRef.current = null;
        setSelectedShopId('');
      }
    };

    loadData();
  }, [currentUrlShopId, dispatch]);

  // Dropdown Change Handler
  const handleDropdownChange = (e) => {
    const targetId = e.target.value;
    setSelectedShopId(targetId);
    
    if (targetId) {
      setSearchParams({ shopId: targetId }); 
    } else {
      lastFetchedIdRef.current = null;
      setSearchParams({});
    }
  };

  // Redux Store to Local Form Sync
  useEffect(() => {
    if (shopInfo) {
      setFormData({
        name: shopInfo.name || '',
        description: shopInfo.description || '',
        address: shopInfo.address || '',
        cuisineType: Array.isArray(shopInfo.cuisineType) 
          ? shopInfo.cuisineType.join(', ') 
          : shopInfo.cuisineType || ''
      });
      setPreviewUrl(shopInfo.banner || '');
    } else {
      setFormData({ name: '', description: '', address: '', cuisineType: '' });
      setPreviewUrl('');
    }
  }, [shopInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); 
    }
  };

  const handleBannerSubmit = async () => {
    if (!selectedShopId) return toast.error("Please select a shop first!");
    if (!selectedFile) return toast.error("Please choose an image!");

    const bannerData = new FormData();
    bannerData.append("banner", selectedFile);
    bannerData.append("shopId", selectedShopId); 

    const loadingToast = toast.loading("Uploading fresh storefront banner...");
    try {
      const res = await dispatch(updateShopBannerThunk(bannerData)).unwrap();
      toast.success(res?.message || "Banner updated successfully! 🌄", { id: loadingToast });
      setSelectedFile(null); 
    } catch (error) {
      toast.error(error || "Banner pipeline error.", { id: loadingToast });
    }
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!selectedShopId) return toast.error("Please select a shop first!");
    if (!formData.name.trim()) return toast.error("Shop name is required!");
    if (!formData.address.trim()) return toast.error("Address is required!");

    const dataToSend = { ...formData, shopId: selectedShopId };
    const loadingToast = toast.loading("Updating shop profiles...");
    
    try {
      const res = await dispatch(updateShopDetailsThunk(dataToSend)).unwrap();
      toast.success(res?.message || "Shop details updated! 🎉", { id: loadingToast });
    } catch (error) {
      toast.error(error || "Failed to update details.", { id: loadingToast });
    }
  };

  const handleDeleteShop = async () => {
    if (!selectedShopId) return toast.error("Please select a shop to delete!");
    if (window.confirm("Are you sure you want to delete this shop permanently?")) {
        const deletionToast = toast.loading("Wiping out store profile...");
        try {
          const res = await dispatch(deleteShopThunk(selectedShopId)).unwrap();
          toast.success(res?.message || "Store successfully removed.", { id: deletionToast });
          lastFetchedIdRef.current = null;
          setSelectedShopId('');
          setSearchParams({});
        } catch (error) {
          toast.error(error || "Failed to delete shop.", { id: deletionToast });
        }
    }
  };

  // 🟢 COMBINED LOADER CHECK: Global aur local dono loaders ko safety boundary di
  const isSyncing = loading || localFetchLoading;

  return (
    <div className='w-full max-w-2xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 md:p-8 mt-4 space-y-8 relative'>
      
      {/* Dynamic Loader Overlay */}
      {isSyncing && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center z-50 rounded-3xl">
          <FiRefreshCw className="text-[#ff4d2d] animate-spin mb-2" size={32} />
          <p className="text-sm font-black text-gray-700">Synchronizing Dashboard Records...</p>
        </div>
      )}

      <div className="mb-6 flex items-center gap-3 border-b border-gray-50 pb-4">
        <div className="p-3 bg-[#ff4d2d]/10 rounded-2xl text-[#ff4d2d] flex items-center justify-center">
          <FiGrid size={20} />
        </div>
        <div>
          <h2 className='text-lg md:text-xl font-extrabold text-gray-800 tracking-wide'>
            Edit Shop Information
          </h2>
          <p className='text-xs text-gray-500 mt-0.5'>Update your storefront identity, images and configurations</p>
        </div>
      </div>

      {/* DROPDOWN SELECTOR */}
      <div className="flex flex-col gap-2 bg-[#ff4d2d]/5 p-5 rounded-2xl border border-[#ff4d2d]/10 transition-all">
        <label className="text-xs font-black uppercase text-gray-700 tracking-wider">
          Select Restaurant to Edit 🎯
        </label>
        <div className="relative w-full">
          <select
            value={selectedShopId}
            onChange={handleDropdownChange}
            className="w-full appearance-none px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all text-sm font-bold text-gray-800 cursor-pointer pr-10 shadow-xs"
          >
            <option value="">-- Choose from your shops --</option>
            {allShops.map((shop) => (
              <option key={shop._id} value={shop._id}>
                {shop.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500">
            <FiChevronDown size={18} />
          </div>
        </div>
      </div>

      {/* BANNER MANAGEMENT */}
      <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
        <label className="text-xs font-black uppercase text-gray-600 tracking-wider block">
          Shop Banner Image
        </label>
        
        <div className="relative w-full h-36 rounded-xl overflow-hidden bg-gray-200 border border-gray-300">
          <img src={previewUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'} alt="Preview" className="w-full h-full object-cover" />
          <label className="absolute bottom-3 right-3 bg-black/70 hover:bg-black/90 backdrop-blur-xs text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 transition-all shadow-sm">
            <FiUploadCloud size={14} />
            Browse Image
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        </div>

        {selectedFile && (
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleBannerSubmit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              Upload Selected Banner
            </button>
          </div>
        )}
      </div>

      {/* MAIN TEXT FORM */}
      <form onSubmit={handleTextSubmit} className="space-y-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black uppercase text-gray-600 tracking-wider">
            Shop Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Savour Foods"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all text-sm font-semibold text-gray-800"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black uppercase text-gray-600 tracking-wider">
            Cuisine Types <span className="text-gray-400 font-medium lowercase">(comma separated)</span>
          </label>
          <input
            type="text"
            name="cuisineType"
            value={formData.cuisineType}
            onChange={handleChange}
            placeholder="e.g., Desi, Fast Food, Chinese"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all text-sm font-semibold text-gray-800"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black uppercase text-gray-600 tracking-wider">
            Physical Address <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="e.g., Satellite Town"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all text-sm font-semibold text-gray-800"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black uppercase text-gray-600 tracking-wider">
            Shop Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all text-sm font-semibold text-gray-800 resize-none"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto bg-[#ff4d2d] hover:bg-[#e03a1b] text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <FiSave size={16} />
            Save Shop Details
          </button>
        </div>
      </form>

      {/* DANGER ZONE */}
      <div className="mt-6 border border-red-200 bg-red-50/40 rounded-2xl p-4 text-left space-y-3">
        <div className="flex items-start gap-2.5">
          <div className="p-2 bg-red-100 rounded-xl text-red-600 mt-0.5">
            <FiTrash2 size={16} />
          </div>
          <div>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Permanently terminate your storefront records from CravingLoop index.
            </p>
          </div>
        </div>
        <div className="pt-1 flex justify-end">
          <button
            type="button"
            onClick={handleDeleteShop}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl"
          >
            Delete Storefront Permanently
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditShopDetails;