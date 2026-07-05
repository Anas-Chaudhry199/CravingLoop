import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActiveDeliveries, completeShipmentDelivery, clearDeliveryErrors } from '../features/user/delivery.slice.js';
import { clearUser } from '../features/user/user.Slice.js';
import { FiPackage, FiMapPin, FiPhone, FiCheckCircle, FiLogOut, FiDollarSign, FiChevronDown, FiChevronUp, FiSearch, FiAlertCircle } from 'react-icons/fi';
import { MdOutlineDeliveryDining, MdOutlineNavigation } from 'react-icons/md';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios'; 
import toast, { Toaster } from 'react-hot-toast';

function DeliveryDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // States
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { deliveries = [], loading, error } = useSelector((state) => state.delivery || {});

  useEffect(() => {
    dispatch(fetchActiveDeliveries());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearDeliveryErrors());
    }
  }, [error, dispatch]);

  const handleMarkAsDelivered = (orderId) => {
    dispatch(completeShipmentDelivery(orderId))
      .unwrap()
      .then(() => {
        toast.success('Order marked as successfully Delivered! 🎉');
      })
      .catch((err) => {
        toast.error(err || 'Failed to update order status.');
      });
  };

  const handleLogout = async () => {
    try {
      toast.loading("Logging out...", { id: "logout-toast" });
      await axios.post('/api/v1/auth/SignOut');
      dispatch(clearUser()); 
      toast.success("Logged out successfully! ", { id: "logout-toast" });
      navigate('/signin'); 
    } catch (error) {
      console.error("Logout Error:", error);
      toast.error("Failed to safely sign out from server.", { id: "logout-toast" });
    }
  };

  // 💰 Calculate total pending cash (Only for COD orders)
  const totalPendingCash = deliveries
    .filter(order => order.paymentMethod?.toLowerCase() !== 'online')
    .reduce((acc, order) => acc + (order.totalAmount || 0), 0);

  // 🔍 Filter deliveries based on Search Input (Name, Phone, or Order ID)
  const filteredDeliveries = deliveries.filter((order) => {
    const query = searchQuery.toLowerCase();
    return (
      order._id?.toLowerCase().includes(query) ||
      order.customer?.fullName?.toLowerCase().includes(query) ||
      order.customer?.mobile?.includes(query)
    );
  });

  const toggleDropdown = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="w-full min-h-screen bg-[#fffcfb] text-gray-800 font-sans antialiased flex flex-col">
      <Toaster position="top-right" />
      
      {/* HEADER NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 px-4 md:px-8 flex items-center justify-between z-50 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#ff4d2d]/10 text-[#ff4d2d] rounded-xl">
            <MdOutlineDeliveryDining size={24} />
          </div>
          <div>
            <span className="text-base font-black text-gray-800 tracking-wide block">Rider Portal</span>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Duty: Active</span>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="p-2.5 bg-gray-50 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
        >
          <FiLogOut size={18} />
        </button>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 pt-24 px-4 md:px-8 pb-12 max-w-4xl w-full mx-auto flex flex-col gap-5">
        
        {/* 🚨 NEW: EMERGENCY RIDER HELPLINE STRIP */}
        <div className="w-full bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-center justify-between gap-3 text-xs font-bold text-rose-700">
          <div className="flex items-center gap-2">
            <FiAlertCircle size={16} className="text-rose-500 animate-pulse shrink-0" />
            <span>Facing any issue or accident on route?</span>
          </div>
          <a 
            href="tel:+923001234567" // Replace with actual company helpline or manager number
            className="bg-rose-600 text-white px-3 py-1.5 rounded-lg hover:bg-rose-700 transition-colors shrink-0"
          >
            Call Support
          </a>
        </div>

        {/* WELCOME BANNER & STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex justify-between items-center">
            <div>
              <h1 className="text-xl font-black text-gray-800 tracking-wide">Assigned Shipments</h1>
              <p className="text-xs font-semibold text-gray-400 mt-0.5">Deliver food hot and safe.</p>
            </div>
            <div className="bg-gray-900 text-white px-4 py-2 rounded-xl text-center shrink-0">
              <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Remaining</span>
              <span className="text-lg font-black tracking-tight">{deliveries?.length || 0} Tasks</span>
            </div>
          </div>

          {/* CASH ON HAND */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <FiDollarSign size={22} />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider">COD To Collect</h3>
                <p className="text-xs font-semibold text-gray-400 mt-0.5">Excludes online paid orders.</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-gray-900 block">Rs. {totalPendingCash.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* 🔍 NEW: CLIENT-SIDE SEARCH BAR */}
        {deliveries.length > 0 && (
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
              <FiSearch size={16} />
            </span>
            <input 
              type="text"
              placeholder="Search by Customer Name, Phone, or Order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-xs font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-200 shadow-xs transition-colors"
            />
          </div>
        )}

        {/* LOADING INDICATOR */}
        {loading && (!deliveries || deliveries.length === 0) && (
          <div className='w-full h-40 flex flex-col items-center justify-center gap-2'>
            <div className='w-8 h-8 border-4 border-[#ff4d2d] border-t-transparent rounded-full animate-spin'></div>
            <p className='text-xs font-bold text-gray-400'>Syncing delivery streams...</p>
          </div>
        )}

        {/* SHIPMENT CARDS GRID */}
        {!loading && filteredDeliveries.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredDeliveries.map((order) => {
              const isOnlinePaid = order.paymentMethod?.toLowerCase() === 'online';
              
              return (
                <div 
                  key={order._id} 
                  className="bg-white border border-gray-100 rounded-2xl shadow-xs p-5 flex flex-col gap-4 hover:border-gray-200 transition-all"
                >
                  {/* Card Top Strip */}
                  <div className="flex justify-between items-start border-b border-gray-50 pb-3">
                    <div>
                      <span className="text-xs font-black text-gray-400 tracking-tight">ORDER ID</span>
                      <span className="text-sm font-black text-gray-800 block">#{order._id?.slice(-6).toUpperCase()}</span>
                    </div>
                    
                    {/* 💳 NEW: PAYMENT METHOD BADGES */}
                    <div className="flex items-center gap-2">
                      <span className={`font-extrabold text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider ${
                        isOnlinePaid 
                          ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {isOnlinePaid ? '💳 Paid Online' : '💵 COD'}
                      </span>
                      <span className="bg-orange-500/10 text-orange-600 font-extrabold text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider">
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Customer Details Block */}
                  <div className="flex flex-col gap-2.5 text-sm font-medium text-gray-600">
                    
                    {/* Expandable Customer & Items Line */}
                    <div 
                      onClick={() => toggleDropdown(order._id)}
                      className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                          <FiPackage size={14} />
                        </div>
                        <span>
                          Customer: <strong className="text-gray-800">{order.customer?.fullName}</strong> ({order.orderItems?.length || 0} Items)
                        </span>
                      </div>
                      <div className="text-gray-400">
                        {expandedOrder === order._id ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                      </div>
                    </div>

                    {/* COLLAPSIBLE ORDER ITEMS */}
                    {expandedOrder === order._id && order.orderItems && (
                      <div className="ml-9 p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Parcel Contents:</p>
                        {order.orderItems.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs font-semibold text-gray-700">
                            <span>{item.itemName || 'Loop Meal'} <span className="text-gray-400 font-bold">x{item.quantity || 1}</span></span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Phone Line */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                        <FiPhone size={14} />
                      </div>
                      <a href={`tel:${order.customer?.mobile}`} className="text-[#ff4d2d] font-bold hover:underline">
                        {order.customer?.mobile || "N/A"}
                      </a>
                    </div>

                    {/* Address Line + Navigation */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 mt-0.5">
                          <FiMapPin size={14} className="text-rose-500" />
                        </div>
                        <span className="text-xs font-semibold text-gray-500 leading-relaxed">
                          {order.deliveryAddress}
                        </span>
                      </div>
                      
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl flex items-center gap-1 text-xs font-bold transition-colors shrink-0"
                      >
                        <MdOutlineNavigation size={14} />
                        <span className="hidden sm:inline">Navigate</span>
                      </a>
                    </div>
                  </div>

                  {/* Footer Action Layer */}
                  <div className="pt-3 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs font-bold text-gray-400">
                        {isOnlinePaid ? "Amount Paid:" : "Cash to Collect:"}
                      </span>
                      <span className={`text-base font-black ${isOnlinePaid ? 'text-blue-600' : 'text-gray-800'}`}>
                        Rs. {order.totalAmount?.toLocaleString()}
                      </span>
                    </div>

                    <button
                      disabled={loading}
                      onClick={() => handleMarkAsDelivered(order._id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/10 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    >
                      <FiCheckCircle size={14} />
                      <span>Mark as Delivered</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          !loading && (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-xs">
              <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiPackage size={28} />
              </div>
              <h3 className="font-bold text-gray-700 text-base">
                {searchQuery ? "No results found!" : "All caught up!"}
              </h3>
              <p className="text-xs font-medium text-gray-400 mt-0.5">
                {searchQuery ? "Try checking spelling or type another keyword." : "No active pending deliveries assigned to your profile right now."}
              </p>
            </div>
          )
        )}

      </main>
    </div>
  );
}

export default DeliveryDashboard;