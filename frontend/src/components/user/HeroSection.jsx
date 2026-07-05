import React, { useState, useEffect } from 'react';

function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // 📸 Optimized Premium Food Banners (Reduced width & query parameters for 10x faster loading)
  const slides = [
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=70", // Juicy Steak
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=70", // Premium Cheesy Pizza
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=70", // Traditional BBQ
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=70"  // Freshly Baked
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="w-full h-[85vh] md:h-[90vh] relative flex items-center justify-center overflow-hidden select-none bg-gray-950">
      
      {/* 1. 🚀 Background Image Slider (Converted from CSS background-image to highly prioritized raw images) */}
      {slides.map((image, index) => (
        <img
          key={index}
          src={image}
          alt={`Food Slide ${index + 1}`}
          // Pehli image ko sab se pehle priority pe load karega browser
          fetchPriority={index === 0 ? "high" : "low"}
          loading={index === 0 ? "eager" : "lazy"}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 transform ease-in-out z-0 ${
            index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        />
      ))}

      {/* 2. Dark Overlay Layer */}
      <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/50 to-black/30 z-10"></div>

      {/* 3. Text Content */}
      <div className="max-w-4xl mx-auto px-6 text-center space-y-6 relative z-20 animate-fadeIn mt-12">
        
        {/* Animated Badge */}
        <span className="inline-block bg-[#ff4d2d] text-white text-[11px] font-black tracking-widest uppercase px-5 py-2 rounded-full shadow-lg shadow-[#ff4d2d]/30 border border-white/20">
          Welcome to CravingLoop
        </span>
        
        {/* Main Punchy Heading */}
        <h1 className="text-4xl md:text-7xl font-black text-white tracking-tight leading-tight drop-shadow-md">
          Craving fulfilled in <br />
          just a few <span className="text-[#ff4d2d] bg-white/10 px-4 py-1 rounded-2xl backdrop-blur-xs">Loops!</span>
        </h1>
        
        {/* Soft Sub-text description */}
        <p className="text-sm md:text-lg text-gray-200 font-semibold max-w-2xl mx-auto drop-shadow-sm leading-relaxed">
          Discover the finest culinary hubs and traditional food spots near you. Fast, reliable, and directly from kitchen grids.
        </p>

        {/* Floating Call-to-action indicator */}
        <div className="pt-6 animate-bounce">
          <span className="text-white/40 text-xs font-bold uppercase tracking-widest block">
            Scroll down to explore
          </span>
          <div className="w-1 h-3 bg-white/40 mx-auto rounded-full mt-2"></div>
        </div>

      </div>
    </div>
  );
}

export default HeroSection;