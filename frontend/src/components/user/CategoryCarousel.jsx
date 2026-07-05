import React from 'react';

// 🔥 Standard categories list with attractive emojis
const categories = [
  { id: 'all', name: 'All Foods', emoji: '🍽️' },
  { id: 'desi', name: 'Desi', emoji: '🍛' },
  { id: 'fastfood', name: 'Fast Food', emoji: '🍔' },
  { id: 'chinese', name: 'Chinese', emoji: '🥢' },
  { id: 'bakery', name: 'Bakery', emoji: '🍰' },
  { id: 'streetfood', name: 'Street Food', emoji: '🍢' }
];

function CategoryCarousel({ selectedCategory, setSelectedCategory }) {
  
  const handleCategoryClick = (categoryId) => {
    // Agar pehle se selected hai toh reset kar do ('all'), warna naya select karo
    if (selectedCategory === categoryId) {
      setSelectedCategory('all');
    } else {
      setSelectedCategory(categoryId);
    }
  };

  return (
    <div className="w-full px-6 max-w-7xl mx-auto space-y-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-black text-gray-900 tracking-tight">What's on your mind?</h3>
        <p className="text-xs font-semibold text-gray-400">Explore premium categories curated just for your mood loops.</p>
      </div>

      {/* Horizontal Scrollable Container */}
      <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-none snap-x">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          
          return (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`flex flex-col items-center justify-center min-w-24 md:min-w-28 h-24 md:h-28 rounded-2xl cursor-pointer snap-start border transition-all duration-300 select-none ${
                isActive
                  ? 'bg-[#ff4d2d] border-[#ff4d2d] text-white shadow-lg shadow-[#ff4d2d]/20 scale-102'
                  : 'bg-white border-gray-100 hover:border-gray-300 text-gray-700 shadow-xs'
              }`}
            >
              <span className="text-2xl md:text-3xl mb-2 transition-transform duration-300 active:scale-90">
                {cat.emoji}
              </span>
              <span className={`text-[11px] md:text-xs font-black tracking-wide ${
                isActive ? 'text-white' : 'text-gray-800'
              }`}>
                {cat.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryCarousel;