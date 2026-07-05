// frontend/src/pages/ShopMenu.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/user/Navbar.jsx'; 
import toast from 'react-hot-toast';
import { IoMdArrowBack } from 'react-icons/io';
import { FaStar, FaLocationDot } from 'react-icons/fa6';
import { useDispatch, useSelector } from 'react-redux'; 
import { addToCart } from '../features/user/cart.slice.js'; 

function ShopMenu() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch(); 
  
  const { user } = useSelector((state) => state.user || {});

  const [shop, setShop] = useState(null); 
  const [items, setItems] = useState([]);  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShopAndMenu = async () => {
      try {
        const [shopRes, menuRes] = await Promise.all([
          axios.get(`/api/v1/shop/c/${shopId}`),
          axios.get(`/api/v1/item/get-shop-items/${shopId}`)
        ]);

        if (shopRes.data.success) setShop(shopRes.data.data);
        if (menuRes.data.success) setItems(menuRes.data.data);

        // 💾 1. Backup shopId to browser space immediately
        if (shopId) {
          localStorage.setItem("currentShopId", shopId);
        }

      } catch (error) {
        console.error("Data loading error:", error);
        toast.error("Failed to load restaurant details or menu.");
      } finally {
        setLoading(false);
      }
    };

    fetchShopAndMenu();
  }, [shopId]);

  // 🔥 2. Redux Cart Handler with context injection
  const handleItemAdd = (item) => {
    const itemWithShopContext = {
      ...item,
      shop: item.shop || shopId // Ensures the shop ID is strictly bound to the item payload
    };

    dispatch(addToCart(itemWithShopContext)); 
    
    toast.success(`${item.name} added to basket!`, {
      position: 'bottom-center',
      style: { fontWeight: 'bold', fontSize: '13px' }
    });
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-[#ff4d2d] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-20 select-none">
      <Navbar />

      {/* 1. 📸 HERO BANNER SEGMENT */}
      <div className="w-full pt-24 px-4">
        <div className="max-w-5xl mx-auto h-60 md:h-80 bg-gray-900 rounded-3xl overflow-hidden relative shadow-md border border-gray-100">
          
          <img 
            src={shop?.banner || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=70"} 
            alt={shop?.name} 
            className="w-full h-full object-cover opacity-70 absolute inset-0"
          />
          
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
          
          <button 
            onClick={() => navigate(-1)} 
            className="absolute top-6 left-6 flex items-center gap-2 text-xs font-black text-white bg-black/40 backdrop-blur-xs px-4 py-2 rounded-xl hover:bg-white hover:text-black transition-all cursor-pointer z-20"
          >
            <IoMdArrowBack size={14} />
            <span>Back</span>
          </button>

          <div className="absolute bottom-6 left-6 md:left-10 text-white max-w-4xl space-y-1.5 z-10 pr-6">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl md:text-4xl font-black tracking-tight drop-shadow-md">
                {shop?.name}
              </h1>
              <div className="flex items-center gap-1 bg-emerald-600 text-white px-2.5 py-0.5 rounded-lg text-[11px] font-black shadow-sm shrink-0">
                <FaStar size={10} />
                <span>{shop?.rating > 0 ? shop.rating.toFixed(1) : 'NEW'}</span>
              </div>
            </div>
            
            <p className="text-[11px] md:text-xs text-gray-200 font-medium max-w-xl drop-shadow-xs line-clamp-2 leading-relaxed">
              {shop?.description || "Traditional and modern culinary combos crafted carefully."}
            </p>
          </div>

        </div>
      </div>

      {/* MAIN CONTAINER FOR INFO & MENU */}
      <div className="max-w-5xl mx-auto px-4 mt-6 space-y-8">
        
        {/* 2. 📍 PROFILE MINI SUMMARY SPEC */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col gap-3">
          <div className="flex items-start gap-2 text-gray-700">
            <FaLocationDot size={15} className="text-[#ff4d2d] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h5 className="text-xs font-black uppercase text-gray-400 tracking-wider">Outlet Address</h5>
              <p className="text-sm font-bold text-gray-800 leading-relaxed">{shop?.address}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-gray-50">
            {shop?.cuisineType?.map((cuisine, index) => (
              <span 
                key={index} 
                className="text-[10px] font-bold bg-[#ff4d2d]/5 text-[#ff4d2d] border border-[#ff4d2d]/10 px-2.5 py-0.5 rounded-md"
              >
                {cuisine}
              </span>
            ))}
          </div>
        </div>

        {/* 3. 🍔 MENU LIST SECTION */}
        <div className="space-y-5">
          <div className="border-b border-gray-200/60 pb-3 flex items-center justify-between">
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Available Menu</h3>
            <span className="text-xs font-black bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full">
              {items.length} Items
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <div 
                key={item._id} 
                className="bg-white p-4 rounded-2xl border border-gray-100/70 shadow-xs flex items-center justify-between gap-4 group hover:border-gray-200 transition-all duration-300"
              >
                <div className="space-y-1 max-w-[70%]">
                  <h4 className="text-base font-black text-gray-800 tracking-tight group-hover:text-[#ff4d2d] transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-xs text-gray-400 font-medium line-clamp-2">
                    {item.description || "Fresh and hot dynamic loop bundle serve."}
                  </p>
                  <div className="text-sm font-black text-gray-900 pt-1">
                    Rs. {item.price}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 shrink-0 relative">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                    <img 
                      src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300"} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <button 
                    onClick={() => handleItemAdd(item)}
                    className="absolute -bottom-2 bg-white text-[#ff4d2d] border border-gray-100 text-xs font-black px-4 py-1.5 rounded-xl shadow-xs hover:bg-[#ff4d2d] hover:text-white transition-all duration-200 active:scale-95 cursor-pointer"
                  >
                    ADD
                  </button>
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="w-full py-16 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-gray-100 shadow-xs">
                <span className="text-4xl">👨‍🍳</span>
                <h3 className="text-sm font-bold text-gray-800 mt-3">Menu is empty</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-xs">Bahi, is outlet ne abhi tak koi items launch nahi kiye loop par.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default ShopMenu;