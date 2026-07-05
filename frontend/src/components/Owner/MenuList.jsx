// frontend/src/components/Owner/MenuList.jsx
import React, { useState } from 'react';
import { FiEdit, FiSearch, FiSliders, FiEye, FiEyeOff } from 'react-icons/fi';
import { LuUtensils } from 'react-icons/lu';

function MenuList({ menuItems = [], setActiveTab, setSelectedEditItem }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState('All'); // 'All' | 'Available' | 'Out of Stock'

  // 📑 1. Available menu items se dynamic categories extract karna
  const categories = ['All', ...new Set(menuItems.map(item => item.category).filter(Boolean))];

  // 🔍 2. Real-time Search aur Multi-Filter Processing Logic
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

    const matchesStock = stockFilter === 'All' ||
      (stockFilter === 'Available' && item.isAvailable) ||
      (stockFilter === 'Out of Stock' && !item.isAvailable);

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 animate-fadeIn">

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-gray-800 tracking-wide flex items-center gap-2">
            <LuUtensils className="text-[#ff4d2d]" />
            <span>Manage Food Menu</span>
          </h2>
          <p className="text-xs font-semibold text-gray-400 mt-0.5">
            Total Items Loaded: {menuItems.length} | Showing: {filteredItems.length}
          </p>
        </div>
        <button
          onClick={() => setActiveTab('add-item')}
          className="bg-[#ff4d2d] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#e6391a] shadow-sm transition-colors cursor-pointer"
        >
          + Add New Dish
        </button>
      </div>

      {/* FILTER CONTROL CONTROLLER LAYER */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col gap-4">
        {/* Search Bar & Stock Slider Toggle */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 relative flex items-center">
            <FiSearch className="absolute left-4 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search dishes by name or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-200/80 rounded-xl text-sm font-medium focus:outline-hidden focus:border-[#ff4d2d] focus:bg-white transition-all text-gray-800"
            />
          </div>

          <div className="relative flex items-center">
            <FiSliders className="absolute left-4 text-gray-400" size={16} />
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200/80 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-[#ff4d2d] focus:bg-white transition-all text-gray-700 appearance-none cursor-pointer"
            >
              <option value="All">All Inventory Stock</option>
              <option value="Available">In Stock Only</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Dynamic Category Horizon Clusters */}
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-gray-50">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${selectedCategory === cat
                  ? 'bg-gray-800 text-white shadow-xs'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* RENDER MENU ITEMS GRID */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col overflow-hidden group hover:shadow-md ${item.isAvailable ? 'border-gray-100' : 'border-dashed border-gray-300 bg-gray-50/40'
                }`}
            >
              {/* Dish Image Frame */}
              <div className="relative w-full h-40 bg-gray-100 overflow-hidden">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 right-3 bg-black/60 text-white text-xs font-black px-2.5 py-1 rounded-lg backdrop-blur-xs">
                  Rs. {item.price}
                </span>

                {/* Out of Stock Layer overlay */}
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                    <span className="bg-rose-600 text-white font-black text-xs px-3 py-1 rounded-full tracking-wide shadow-md">
                      OUT OF STOCK
                    </span>
                  </div>
                )}
              </div>

              {/* Text Description Block */}
              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-800 text-base group-hover:text-[#ff4d2d] transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-sm uppercase tracking-wider shrink-0">
                      {item.category || 'General'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-medium mt-1 line-clamp-2">
                    {item.description || 'No description listed for this dish item.'}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                    {item.isAvailable ? (
                      <><FiEye className="text-emerald-500" /> Active</>
                    ) : (
                      <><FiEyeOff className="text-gray-400" /> Hidden</>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedEditItem(item)}
                    className="flex items-center gap-1 bg-gray-50 text-gray-700 hover:bg-[#ff4d2d]/10 hover:text-[#ff4d2d] text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-gray-100"
                  >
                    <FiEdit size={12} />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-xs">
          <p className="text-sm font-bold text-gray-500">No dishes match your query.</p>
          <p className="text-xs font-medium text-gray-400 mt-0.5">Try altering your text keyword search or clearing filter parameters.</p>
        </div>
      )}
    </div>
  );
}

export default MenuList;