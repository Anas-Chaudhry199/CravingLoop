import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchShopOrdersThunk, updateOrderStatusThunk } from '../../features/user/order.slice.js'; 
import toast from 'react-hot-toast';
import { FiRefreshCw, FiPhone, FiLayers, FiActivity, FiCheckCircle } from 'react-icons/fi';

function OrdersTracker() {
  const dispatch = useDispatch();
  
  // Redux store se orders extract kiye
  const { orders = [], loading } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(fetchShopOrdersThunk());
  }, [dispatch]);

  // 🎯 1. Active Orders Filtering: Jo orders Cancelled ya Delivered ho chuke hain unhe feed se hata do
  const activeOrders = orders.filter(
    (order) => order.status !== 'Cancelled' && order.status !== 'Delivered'
  );

  // 📊 2. Dynamic Counters (Yeh poore original orders array par calculate honge)
  const totalReceived = orders.length;
  const totalPendingOrPreparing = orders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length;
  const totalCompleted = orders.filter(o => o.status === 'Delivered').length;

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Preparing': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Out for Delivery': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cancelled': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    // ⚠️ Double toast se bachne ke liye sirf unique handler toast use kiya
    const loadingToast = toast.loading(`Updating status to ${newStatus}...`);
    try {
      await dispatch(updateOrderStatusThunk({ orderId, status: newStatus })).unwrap();
      toast.success(`Order status updated to ${newStatus}!`, { id: loadingToast });
      
      // Status update ke baad list ko refresh karlo taake filter successfully apply ho jaye
      dispatch(fetchShopOrdersThunk());
    } catch (error) {
      toast.error(error || "Failed to update status", { id: loadingToast });
    }
  };

  return (
    <div className='w-full max-w-5xl mx-auto p-4 md:p-6 space-y-6 select-none'>
      
      {/* Upper Header Meta Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h1 className='text-xl md:text-2xl font-black text-gray-800 tracking-wide flex items-center gap-2'>
            Live Order Tracker
          </h1>
          <p className='text-xs text-gray-500 mt-1'>Manage your incoming storefront orders and track preparation lifecycles.</p>
        </div>
        
        <button
          onClick={() => dispatch(fetchShopOrdersThunk())}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <FiRefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Feed
        </button>
      </div>

      {/* 📊 Order Analytics Stats Cards Counter Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-gray-50 text-gray-600 rounded-xl"><FiLayers size={18} /></div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Received</p>
            <p className="text-xl font-black text-gray-800">{totalReceived}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><FiActivity size={18} /></div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Active Cookings</p>
            <p className="text-xl font-black text-gray-800">{totalPendingOrPreparing}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><FiCheckCircle size={18} /></div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Completed Logs</p>
            <p className="text-xl font-black text-gray-800">{totalCompleted}</p>
          </div>
        </div>
      </div>

      {/* Main Container Handling */}
      {activeOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-xs">
          <span className="text-4xl block mb-3">🍳</span>
          <h3 className="text-base font-bold text-gray-700">No Active Running Orders</h3>
          <p className="text-xs text-gray-400 mt-1">Incoming live orders awaiting preparation will be listed right here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {activeOrders.map((order) => (
            <div 
              key={order._id} 
              className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 md:p-6 flex flex-col md:flex-row justify-between gap-6 hover:border-gray-200 transition-all"
            >
              {/* Left Side: Order Core Details */}
              <div className="space-y-4 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                    ID: #{order._id?.slice(-6).toUpperCase()}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getStatusStyles(order.status)}`}>
                    • {order.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just Now'}
                  </span>
                </div>

                {/* Customer Info Box */}
                <div className="bg-gray-50/70 rounded-xl p-3 border border-gray-100/50 space-y-1 text-xs">
                  <p className="font-extrabold text-gray-700">{order.customer?.name || "Anonymous Customer"}</p>
                  <p className="text-gray-500 flex items-center gap-1">
                    <FiPhone size={12} /> {order.customer?.mobile || "No Contact Number"}
                  </p>
                  <p className="text-gray-400 font-medium mt-1">📍 {order.deliveryAddress || "Standard Store Pickup"}</p>
                </div>

                {/* Items Ordered List */}
                <div className="space-y-2">
                  <p className="text-xs font-black uppercase text-gray-500 tracking-wider">Items Summary</p>
                  <div className="space-y-1.5">
                    {order.orderItems?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm text-gray-700 font-semibold">
                        <img 
                          src={item.menuItem?.image || 'https://placehold.co/40'} 
                          alt="" 
                          className="w-8 h-8 rounded-lg object-cover bg-gray-100"
                        />
                        <p className="flex-1">
                          {item.menuItem?.name || "Deleted Food Item"} 
                          <span className="text-[#ff4d2d] text-xs font-black ml-2">x {item.quantity}</span>
                        </p>
                        <p className="text-gray-500 text-xs">Rs. {(item.priceAtOrder || item.price || 0) * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side: Action Controls & Total Billing */}
              <div className="flex flex-col justify-between items-end gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100 min-w-50">
                <div className="text-right w-full md:w-auto">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Amount</p>
                  <p className="text-xl font-black text-gray-800 mt-0.5">Rs. {order.totalAmount}</p>
                  <span className={`inline-block text-[10px] font-black uppercase tracking-widest mt-1 px-1.5 py-0.5 rounded ${order.isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    {order.isPaid ? 'Paid' : 'Unpaid'} ({order.paymentMethod || "COD"})
                  </span>
                </div>

                {/* Dropdown For Changing Statuses */}
                <div className="w-full space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block md:text-right">
                    Update Progress
                  </label>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none text-xs font-bold text-gray-700 shadow-xs cursor-pointer transition-all focus:border-[#ff4d2d]"
                  >
                    <option value="Pending">⌛ Pending</option>
                    <option value="Preparing">🍳 Preparing</option>
                    <option value="Out for Delivery">🛵 Out for Delivery</option>
                    <option value="Delivered">✅ Delivered (Archive)</option>
                    <option value="Cancelled">❌ Cancelled (Remove)</option>
                  </select>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrdersTracker;