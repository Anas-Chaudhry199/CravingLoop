import React from 'react';
import { FiArrowRight } from 'react-icons/fi';

function PromoBanner() {
  return (
    <div className="max-w-7xl mx-auto px-4 pt-4">
      <div className="w-full bg-linear-to-br from-gray-900 to-gray-950 text-white rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden border border-gray-800">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-xl md:text-2xl font-black tracking-tight">CravingLoop Order Tracks</h2>
          <p className="text-xs text-gray-400 max-w-md font-medium">
            Get super fast food cycles mapping right onto your screens. Keep filtering your loops till total fulfillment!
          </p>
        </div>
        <button className="bg-white hover:bg-gray-100 text-gray-900 text-xs font-black px-5 py-3.5 rounded-xl transition-all active:scale-95 shrink-0 flex items-center gap-1.5 cursor-pointer">
          Explore Offers <FiArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

export default PromoBanner;