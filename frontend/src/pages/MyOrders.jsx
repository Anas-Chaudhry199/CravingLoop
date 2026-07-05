// frontend/src/pages/MyOrders.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/user/Navbar.jsx';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { IoMdRefresh } from 'react-icons/io'; // 🔄 Fresh sync icon for active polling

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // 👈 Instant individual reload trigger state
  const navigate = useNavigate();

  const fetchOrderHistory = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const response = await axios.get('/api/v1/shop/order/history');
      
      // Safe dynamic payload validation wrapper execution
      if (response.data?.success) {
        // Agar response.data.data direct array hai ya nested object, dono cases safe handle honge
        const fetchedData = Array.isArray(response.data.data) ? response.data.data : response.data.data?.orders || [];
        setOrders(fetchedData);
      }
    } catch (error) {
      console.error("Order history loading error:", error);
      toast.error(error.response?.data?.message || "Failed to load order history.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Preparing': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Out for Delivery': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-[#ff4d2d] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-gray-500">Loading Order History...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-20 select-none">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 pt-24 space-y-6">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-1.5 text-[11px] font-black uppercase text-gray-400 hover:text-[#ff4d2d] transition-all cursor-pointer bg-white border border-gray-200 px-3 py-1.5 rounded-xl shadow-xs"
          >
            ← Go Back
          </button>

          {/* 🔄 Interactive Real-time Async Refresh Anchor */}
          <button
            onClick={() => fetchOrderHistory(true)}
            disabled={refreshing}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-[#ff4d2d] bg-white border border-gray-200 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60"
          >
            <IoMdRefresh size={14} className={refreshing ? "animate-spin text-[#ff4d2d]" : ""} />
            <span>{refreshing ? "Syncing..." : "Refresh"}</span>
          </button>
        </div>
        
        <div className="border-b border-gray-200 pb-3">
          <h2 className="text-lg font-black text-gray-900 tracking-tight">Your Orders</h2>
          <p className="text-xs text-gray-400 font-medium mt-0.5">Track and view your previous food bundle logs.</p>
        </div>

        {orders.length === 0 ? (
          <div className="w-full py-16 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-gray-100 shadow-xs">
            <span className="text-5xl">🥡</span>
            <h3 className="text-sm font-bold text-gray-700 mt-4">No orders placed yet</h3>
            <button onClick={() => navigate('/')} className="mt-3 text-xs font-black bg-[#ff4d2d] text-white px-5 py-2.5 rounded-xl cursor-pointer">
              Order Something Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4 transition-all hover:border-gray-200">
                
                {/* Header Context Section */}
                <div className="flex items-center justify-between border-b border-gray-50 pb-3 flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-gray-800 tracking-tight">{order.shop?.name || "CravingLoop Outlet"}</h4>
                      {/* 🆔 Short Micro ID invoice snippet tracking anchor */}
                      <span className="text-[9px] font-black tracking-wider text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                        #{order._id?.slice(-6).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                      Ordered on: {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                    </p>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border ${getStatusColor(order.status || 'Pending')}`}>
                    • {order.status || 'Pending'}
                  </span>
                </div>

                {/* Items Array Listing */}
                <div className="space-y-2.5">
                  {order.orderItems?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-xs font-bold text-gray-600">
                      <div className="flex items-center gap-2 max-w-[70%]">
                        <span className="text-[#ff4d2d] font-black">x{item.quantity}</span>
                        <span className="truncate text-gray-800">{item.menuItem?.name || "Food Item"}</span>
                      </div>
                      <span className="text-gray-900">Rs. {(item.priceAtOrder || item.price || 0) * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* 🏠 Short Delivery Address Metadata Hint */}
                {order.deliveryAddress && (
                  <p className="text-[10px] text-gray-400 font-medium bg-gray-50/50 p-2 rounded-xl border border-gray-100/50 line-clamp-1">
                    📍 {order.deliveryAddress}
                  </p>
                )}

                {/* Footer Meta Section */}
                <div className="border-t border-gray-50 pt-3 flex items-center justify-between text-xs font-bold text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <span>Payment:</span> 
                    <span className="text-gray-700 font-black uppercase">{order.paymentMethod || "COD"}</span> 
                    {order.isPaid ? (
                      <span className="text-[9px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md font-black">PAID</span>
                    ) : (
                      <span className="text-[9px] text-orange-600 bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded-md font-black">UNPAID</span>
                    )}
                  </div>
                  <div className="text-sm font-black text-gray-900">
                    Total Bill: <span className="text-[#ff4d2d]">Rs. {order.totalAmount}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;