import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaLocationDot } from 'react-icons/fa6';

function RestaurantGrid({ filteredShops = [] }) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {filteredShops.map((shop) => (
        <div
          key={shop._id}
          // 🚀 Kisi bhi restriction ke bagair seedha dynamic menu page par jao
          onClick={() => navigate(`/shop/${shop._id}`)}
          className="group bg-white rounded-2xl overflow-hidden border border-gray-100/80 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col h-full relative"
        >
          
          {/* Featured Badge */}
          {shop.isFeatured && (
            <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-xs text-white text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-md z-10 shadow-sm">
              ✨ Featured
            </span>
          )}

          {/* 1. Image Container */}
          <div className="w-full h-48 overflow-hidden bg-gray-100 relative">
            <img
              src={shop.banner || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=70"}
              alt={shop.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 ease-out"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent" />
          </div>

          {/* 2. Content Body */}
          <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-base font-black text-gray-900 tracking-tight group-hover:text-[#ff4d2d] transition-colors truncate max-w-[80%]">
                  {shop.name}
                </h4>
                
                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg text-[11px] font-black shrink-0 border border-emerald-100">
                  <FaStar size={10} className="fill-current" />
                  <span>{shop.rating > 0 ? shop.rating.toFixed(1) : 'NEW'}</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed">
                {shop.description || "No description provided by the outlet."}
              </p>
            </div>

            {/* 3. Footer Segment */}
            <div className="space-y-3 pt-2 border-t border-gray-50">
              <div className="flex flex-wrap gap-1.5">
                {shop.cuisineType.map((cuisine, index) => (
                  <span
                    key={index}
                    className="text-[10px] font-bold bg-gray-50 text-gray-600 px-2 py-0.5 rounded-md border border-gray-100/50"
                  >
                    {cuisine}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-1 text-gray-400">
                <FaLocationDot size={11} className="text-[#ff4d2d]/70 shrink-0" />
                <span className="text-[11px] font-bold text-gray-400 truncate w-full">
                  {shop.address}
                </span>
              </div>
            </div>
          </div>

        </div>
      ))}
    </div>
  );
}

export default RestaurantGrid;