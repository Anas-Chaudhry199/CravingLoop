import React, { useState, useEffect } from 'react';
import Navbar from './user/Navbar.jsx';
import HeroSection from './user/HeroSection.jsx';
import CategoryCarousel from './user/CategoryCarousel.jsx';
import RestaurantGrid from './user/RestaurantGrid.jsx';
import PromoBanner from './user/PromoBanner.jsx';
import RestaurantSkeleton from '.././components/RestaurantSkeleton.jsx'; 
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiStar, FiTruck, FiCopy, FiClock, FiShield, FiMapPin } from 'react-icons/fi';

function UserDashboard() {
  const [shops, setShops] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [locationPermission, setLocationPermission] = useState('prompt'); 

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [filterTopRated, setFilterTopRated] = useState(false);
  const [filterFreeDelivery, setFilterFreeDelivery] = useState(false);

  // 🏷️ Mock Promo Vouchers Data 
  const vouchers = [
    { id: 1, code: 'CRAVING50', discount: 'Rs. 50 OFF', desc: 'Min. order Rs. 300', bg: 'from-orange-500 to-red-500' },
    { id: 2, code: 'LOOPFREE', discount: 'FREE DELIVERY', desc: 'On top 5 local brands', bg: 'from-amber-500 to-orange-600' },
    { id: 3, code: 'FIRST250', discount: 'Rs. 250 OFF', desc: 'First delivery loop only', bg: 'from-rose-500 to-pink-600' },
    { id: 4, code: 'DESILOOP', discount: '15% OFF', desc: 'Valid on Desi Cuisines', bg: 'from-emerald-500 to-teal-600' },
  ];

  const handleCopyVoucher = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Promo "${code}" copied! Paste at checkout.`);
  };

  // Geolocation & Backend Data Fetching Effect
  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { longitude, latitude } = position.coords;
        setLocationPermission('granted');
        
        try {
          const response = await axios.get(`/api/v1/shop/nearby?lng=${longitude}&lat=${latitude}`);
          if (response.data.success) {
            setShops(response.data.data);
          }
        } catch (error) {
          console.error("Fetch Shops Error:", error);
          toast.error(error.response?.data?.message || "Failed to load nearby restaurants.");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Location Error:", error);
        setLocationPermission('denied');
        setLoading(false);
        toast.error("Please allow location permission to find restaurants within 5km radius.");
      }
    );
  }, []);

  // Debouncing Logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 350);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Filter Logic
  const filteredShops = shops.filter((shop) => {
    const matchesSearch = shop.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      shop.cuisineType.some(c => c.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' ||
      shop.cuisineType.some(c => c.toLowerCase().replace(' ', '') === selectedCategory);

    const matchesRating = !filterTopRated || (shop.rating && shop.rating >= 4.0);
    const matchesDelivery = !filterFreeDelivery || shop.deliveryFee === 0 || shop.isFreeDelivery;

    return matchesSearch && matchesCategory && matchesRating && matchesDelivery;
  });

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="w-full min-h-screen bg-gray-50/50 pb-16">
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div className="space-y-12 pt-20">
        
        {!isSearching && (
          <>
            <HeroSection />

            {/* 🏷️ ACTIVE PROMO VOUCHERS SLIDER SECTION */}
            <div className="px-6 max-w-7xl mx-auto space-y-3">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-lg font-black text-gray-800 tracking-tight">Deals & Vouchers For You</h3>
                <p className="text-xs font-semibold text-gray-400">Click to copy code and apply at checkout.</p>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-2 pt-1 scroll-smooth snap-x no-scrollbar">
                {vouchers.map((voucher) => (
                  <div 
                    key={voucher.id}
                    onClick={() => handleCopyVoucher(voucher.code)}
                    className={`min-w-65 md:min-w-70 bg-linear-to-br ${voucher.bg} text-white p-4 rounded-2xl flex flex-col justify-between h-28 cursor-pointer shadow-xs active:scale-98 transition-all snap-start group relative overflow-hidden`}
                  >
                    <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-white/80 uppercase tracking-wider">{voucher.desc}</p>
                        <h4 className="text-lg font-black mt-0.5 tracking-tight">{voucher.discount}</h4>
                      </div>
                      <span className="p-1.5 bg-white/20 rounded-lg backdrop-blur-xs group-hover:bg-white/30 transition-colors">
                        <FiCopy size={14} />
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-black/10 -mx-4 -mb-4 px-4 py-2 mt-2 border-t border-white/10">
                      <span className="text-xs font-black tracking-widest bg-white text-gray-900 px-2 py-0.5 rounded-md">
                        {voucher.code}
                      </span>
                      <span className="text-[10px] font-bold text-white/90 flex items-center gap-1">
                        Claim Voucher
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <CategoryCarousel selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
          </>
        )}

        {/* Main Restaurants Grid Container */}
        <div className="px-6 max-w-7xl mx-auto space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                {isSearching ? '🔍 Search Results' : '🔥 Popular Restaurants Around You'}
              </h2>
              <p className="text-xs font-semibold text-gray-500">
                {isSearching 
                  ? `Showing matches for "${searchQuery}"` 
                  : 'Top picked restaurants within 5km radius of your live location.'}
              </p>
            </div>

            {/* Quick Action Badges */}
            {!loading && locationPermission === 'granted' && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <button 
                  onClick={() => setFilterTopRated(!filterTopRated)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 whitespace-nowrap ${
                    filterTopRated 
                      ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-xs' 
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <FiStar size={14} className={filterTopRated ? 'fill-amber-500 text-amber-500' : ''} />
                  Top Rated 4.0+
                </button>

                <button 
                  onClick={() => setFilterFreeDelivery(!filterFreeDelivery)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 whitespace-nowrap ${
                    filterFreeDelivery 
                      ? 'bg-[#ff4d2d]/5 border-[#ff4d2d]/30 text-[#ff4d2d] shadow-xs' 
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <FiTruck size={14} />
                  Free Delivery
                </button>
              </div>
            )}
          </div>

          {/* 🔄 Loading State with Skeletons */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <RestaurantSkeleton key={idx} />
              ))}
            </div>
          ) : locationPermission === 'denied' ? (
            <div className="w-full py-16 flex flex-col items-center justify-center text-center bg-amber-50/40 rounded-2xl border border-amber-100">
              <span className="text-4xl">📍</span>
              <h3 className="text-sm font-bold text-amber-900 mt-3">Location Access Required</h3>
              <p className="text-xs text-amber-700/80 mt-1 max-w-xs">
                Bahi, jab tak aap location permit nahi karenge, hum 5km ka radius calculate nahi kar payenge. Please browser bar se settings reset karein.
              </p>
            </div>
          ) : (
            <RestaurantGrid filteredShops={filteredShops} />
          )}

          {/* No results handler */}
          {!loading && locationPermission === 'granted' && filteredShops.length === 0 && (
            <div className="w-full py-16 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-gray-100 shadow-xs">
              <span className="text-4xl">🍕</span>
              <h3 className="text-sm font-bold text-gray-800 mt-3">No matching results</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                no restaurents avaiables
              </p>
            </div>
          )}
        </div>

        {!isSearching && <PromoBanner />}

        {/* 🛡️ 3. LOOP SAFETY / TRUST BADGES GRID */}
        {!isSearching && (
          <div className="px-6 max-w-7xl mx-auto pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-white border border-gray-100 p-6 rounded-2xl shadow-xs">
              
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-50 text-[#ff4d2d] rounded-xl">
                  <FiClock size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">30 Mins Fast Delivery</h4>
                  <p className="text-xs font-medium text-gray-400 mt-0.5">Garama garam khana aapke door-step par loop speed se.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 border-t sm:border-t-0 sm:border-x border-gray-100 pt-4 sm:pt-0 sm:px-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <FiShield size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">100% Hygiene Certified</h4>
                  <p className="text-xs font-medium text-gray-400 mt-0.5">Sare partners strict quality standards follow karte hain.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 border-t sm:border-t-0 pt-4 sm:pt-0">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <FiMapPin size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Live Rider Tracking</h4>
                  <p className="text-xs font-medium text-gray-400 mt-0.5">Real-time status check karein kitchen se lekar ghar tak.</p>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default UserDashboard;