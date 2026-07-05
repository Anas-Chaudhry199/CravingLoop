// src/components/user/RestaurantSkeleton.jsx
import React from 'react';

function RestaurantSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs animate-pulse">
      {/* Image Block */}
      <div className="w-full h-44 bg-gray-200"></div>
      
      {/* Content Block */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          {/* Shop Name Shimmer */}
          <div className="h-4 w-2/3 bg-gray-200 rounded-md"></div>
          {/* Rating Badge Shimmer */}
          <div className="h-4 w-10 bg-gray-200 rounded-md"></div>
        </div>
        
        {/* Cuisine Types Shimmer */}
        <div className="h-3 w-1/2 bg-gray-200 rounded-md"></div>
        
        <hr className="border-gray-100" />
        
        {/* Delivery Time & Fee Shimmer */}
        <div className="flex items-center justify-between pt-1">
          <div className="h-3 w-20 bg-gray-200 rounded-md"></div>
          <div className="h-3 w-16 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    </div>
  );
}

export default RestaurantSkeleton;