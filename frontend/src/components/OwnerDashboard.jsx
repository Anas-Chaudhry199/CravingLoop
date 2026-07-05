import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom'; 
import { fetchShopDashboardData } from '../features/user/shopMenu.slice.js';
// 🟢 NEW IMPORT: Orders fetch karne ka thunk import kiya
import { fetchShopOrdersThunk } from '../features/user/order.slice.js'; 
import Navbar from './user/Navbar.jsx';
import EditItemModal from './Owner/EditItemModal.jsx'; 
import AddItemForm from './Owner/AddItemForm.jsx'; 
import MenuList from './Owner/MenuList.jsx'; 
import EditShopDetails from './Owner/EditShopDetails.jsx'; 
import OrdersTracker from './Owner/OrdersTracker.jsx'; 
import CreateShopForm from './Owner/CreateShopForm.jsx'; 
import { LuUtensilsCrossed, LuTrendingUp } from "react-icons/lu";
import { FiPlusCircle, FiEdit3, FiShoppingBag, FiCheckCircle } from "react-icons/fi"; 
import { IoStorefrontOutline, IoWalletOutline } from "react-icons/io5";   
import toast from 'react-hot-toast'; 

function OwnerDashboard() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedEditItem, setSelectedEditItem] = useState(null);

  const [searchParams] = useSearchParams();
  const urlShopId = searchParams.get('shopId') || '';

  const { shopInfo, menuItems = [], loading, error } = useSelector((state) => state.shopMenu || {});
  const { orders = [] } = useSelector((state) => state.order || {});

  // ⚡ FIXED: Shop metadata ke sath sath orders data pipeline ko bhi async-fire kiya
  useEffect(() => {
    if (urlShopId) {
      dispatch(fetchShopDashboardData(urlShopId));
      dispatch(fetchShopOrdersThunk(urlShopId)); // 🟢 Targeted shop orders pipeline
    } else {
      dispatch(fetchShopDashboardData());
      dispatch(fetchShopOrdersThunk());          // 🟢 Fallback: Global multi-shop blend lists
    }
  }, [dispatch, urlShopId]); 

  useEffect(() => {
    if (error) {
      toast.error(error || 'Failed to fetch dashboard records.', { id: 'dashboard-fetch-error' });
    }
  }, [error]);

  const pendingOrdersCount = orders.filter(
    (order) => order.status === 'Pending' || order.status === 'Preparing'
  ).length;

  const deliveredOrders = orders.filter(order => order.status === 'Delivered');
  const totalDeliveredCount = deliveredOrders.length;
  
  const totalSalesRevenue = deliveredOrders.reduce((sum, order) => {
    return sum + (Number(order.totalAmount || order.totalPrice || 0));
  }, 0);

  return (
    <div className='w-full min-h-screen bg-[#fffcfb] text-gray-800 font-sans antialiased flex flex-col'>
      <Navbar />
      
      <div className='w-full flex-1 pt-20 flex flex-col md:flex-row overflow-hidden pb-16 md:pb-0'>

        {/* SIDEBAR */}
        {!loading && shopInfo && (
          <div className='fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 flex flex-row justify-around p-2 shadow-lg md:relative md:bottom-auto md:left-auto md:right-auto md:z-0 md:w-64 md:h-full md:border-t-0 md:border-r md:flex-col md:justify-between md:p-4 md:shadow-sm shrink-0 select-none'>
            <div className='w-full flex flex-row justify-around gap-1 md:flex-col md:justify-start md:gap-2'>
              <div className='hidden md:block px-3 py-2 mb-4'>
                <h2 className='text-xs font-bold uppercase tracking-wider text-gray-400'>Store Management</h2>
              </div>

              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 md:flex-none flex flex-col md:flex-row items-center gap-1 md:gap-3 px-2 py-2 md:px-4 md:py-3 rounded-xl text-[11px] md:text-sm font-semibold transition-all duration-200 ${activeTab === 'overview' ? 'bg-[#ff4d2d]/10 text-[#ff4d2d]' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <IoStorefrontOutline size={18} /> 
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 md:flex-none flex flex-col md:flex-row items-center justify-between gap-1 md:gap-3 px-2 py-2 md:px-4 md:py-3 rounded-xl text-[11px] md:text-sm font-semibold transition-all duration-200 ${activeTab === 'orders' ? 'bg-[#ff4d2d]/10 text-[#ff4d2d]' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <div className="flex flex-col md:flex-row items-center gap-1 md:gap-3">
                  <FiShoppingBag size={18} /> 
                  <span>Live Orders</span>
                </div>
                
                {pendingOrdersCount > 0 && (
                  <span className="bg-orange-500 text-white font-black text-[10px] md:text-xs px-2 py-0.5 md:py-1 rounded-full md:mr-1 animate-pulse">
                    {pendingOrdersCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('menu')}
                className={`flex-1 md:flex-none flex flex-col md:flex-row items-center gap-1 md:gap-3 px-2 py-2 md:px-4 md:py-3 rounded-xl text-[11px] md:text-sm font-semibold transition-all duration-200 ${activeTab === 'menu' ? 'bg-[#ff4d2d]/10 text-[#ff4d2d]' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <LuUtensilsCrossed size={18} /> 
                <span className='truncate'>Menu ({menuItems.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('add-item')}
                className={`flex-1 md:flex-none flex flex-col md:flex-row items-center gap-1 md:gap-3 px-2 py-2 md:px-4 md:py-3 rounded-xl text-[11px] md:text-sm font-semibold transition-all duration-200 ${activeTab === 'add-item' ? 'bg-[#ff4d2d]/10 text-[#ff4d2d]' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <FiPlusCircle size={18} /> 
                <span>Add Item</span>
              </button>

              <button
                onClick={() => setActiveTab('edit-shop')}
                className={`flex-1 md:flex-none flex flex-col md:flex-row items-center gap-1 md:gap-3 px-2 py-2 md:px-4 md:py-3 rounded-xl text-[11px] md:text-sm font-semibold transition-all duration-200 ${activeTab === 'edit-shop' ? 'bg-[#ff4d2d]/10 text-[#ff4d2d]' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <FiEdit3 size={18} /> 
                <span>Edit Shop</span>
              </button>
            </div>

            <div className='hidden md:block bg-gray-50 p-4 rounded-2xl border border-gray-100'>
              <p className='text-xs font-semibold text-gray-400'>Status</p>
              <div className='flex items-center gap-2 mt-1'>
                <span className='w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse'></span>
                <span className='text-sm font-bold text-gray-700'>Live & Accepting</span>
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT WINDOW */}
        <div className='flex-1 h-full overflow-y-auto bg-[#faf6f3] p-4 md:p-8'>

          {loading && activeTab !== 'orders' && !shopInfo && (
            <div className='w-full h-64 flex flex-col items-center justify-center gap-3'>
              <div className='w-10 h-10 border-4 border-[#ff4d2d] border-t-transparent rounded-full animate-spin'></div>
              <p className='text-sm font-medium text-gray-500'>Synchronizing dashboard records...</p>
            </div>
          )}

          {!loading && error && (
            <div className='max-w-xl bg-rose-50 border border-rose-100 p-5 rounded-2xl text-rose-700 mx-auto'>
              <p className='font-bold text-sm'>🚨 System Error:</p>
              <p className='text-xs font-semibold mt-1'>{error}</p>
              <button onClick={() => dispatch(fetchShopDashboardData(urlShopId))} className='mt-3 w-full sm:w-auto bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-rose-700 transition-colors'>
                Retry Application Call
              </button>
            </div>
          )}

          {!loading && !error && !shopInfo && (
            <div className='max-w-xl mx-auto bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-xs text-center mt-4 animate-fadeIn'>
              <h2 className='text-xl font-black text-gray-800 tracking-wide'>Setup Your Restaurant Profile</h2>
              <p className='text-xs font-semibold text-gray-400 mt-1 mb-6'>
                Welcome bhai! Initialize your storefront profile to unlock the management dashboard.
              </p>
              <CreateShopForm />
            </div>
          )}

          {/* TAB 1: OVERVIEW WITH ANALYTICS */}
          {shopInfo && activeTab === 'overview' && (
            <div className='max-w-4xl flex flex-col gap-6'>
              
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                <div className='bg-white border border-gray-100 p-5 rounded-2xl shadow-xs flex items-center justify-between'>
                  <div className='flex flex-col'>
                    <span className='text-xs font-bold text-gray-400 uppercase tracking-wider'>Total Revenue</span>
                    <span className='text-2xl font-black text-gray-800 mt-1'>Rs. {totalSalesRevenue.toLocaleString()}</span>
                    <span className='text-[10px] text-emerald-500 font-bold flex items-center gap-0.5 mt-1'>
                      <LuTrendingUp size={12}/> Live Earnings
                    </span>
                  </div>
                  <div className='p-3 bg-emerald-50 text-emerald-500 rounded-xl'>
                    <IoWalletOutline size={24} />
                  </div>
                </div>

                <div className='bg-white border border-gray-100 p-5 rounded-2xl shadow-xs flex items-center justify-between'>
                  <div className='flex flex-col'>
                    <span className='text-xs font-bold text-gray-400 uppercase tracking-wider'>Orders Delivered</span>
                    <span className='text-2xl font-black text-gray-800 mt-1'>{totalDeliveredCount}</span>
                    <span className='text-[10px] text-gray-400 font-semibold mt-1'>Completed checkouts</span>
                  </div>
                  <div className='p-3 bg-blue-50 text-blue-500 rounded-xl'>
                    <FiCheckCircle size={24} />
                  </div>
                </div>

                <div className='bg-white border border-gray-100 p-5 rounded-2xl shadow-xs flex items-center justify-between'>
                  <div className='flex flex-col'>
                    <span className='text-xs font-bold text-gray-400 uppercase tracking-wider'>Active Items</span>
                    <span className='text-2xl font-black text-gray-800 mt-1'>{menuItems.length}</span>
                    <span className='text-[10px] text-gray-400 font-semibold mt-1'>Listed on storefront</span>
                  </div>
                  <div className='p-3 bg-orange-50 text-[#ff4d2d] rounded-xl'>
                    <LuUtensilsCrossed size={24} />
                  </div>
                </div>
              </div>

              {/* RESTAURANT INFO DETAILS */}
              <div className='w-full bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100/80'>
                <div className='relative w-full h-40 md:h-56 rounded-xl md:rounded-2xl overflow-hidden shadow-inner bg-gray-100'>
                  <img src={shopInfo.banner || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'} alt="Shop Banner" className='w-full h-full object-cover' />
                  <div className='absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex items-end p-4 md:p-6'>
                    <h1 className='text-xl md:text-3xl font-black text-white tracking-wide'>{shopInfo.name}</h1>
                  </div>
                </div>
                <div className='mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6'>
                  <div className='flex flex-col gap-4'>
                    <div>
                      <h3 className='text-xs font-bold uppercase tracking-wider text-gray-400'>Description</h3>
                      <p className='text-gray-700 font-medium mt-1 text-sm md:text-base'>{shopInfo.description}</p>
                    </div>
                    <div>
                      <h3 className='text-xs font-bold uppercase tracking-wider text-gray-400'>Address</h3>
                      <p className='text-gray-600 font-medium mt-1 text-sm'>{shopInfo.address}</p>
                    </div>
                  </div>
                  <div className='flex flex-col gap-4 bg-gray-50 p-4 md:p-5 rounded-2xl border border-gray-100/50'>
                    <div>
                      <h3 className='text-xs font-bold uppercase tracking-wider text-gray-400'>Cuisines Served</h3>
                      <div className='flex flex-wrap gap-1.5 mt-2'>
                        {shopInfo.cuisineType?.map((cuisine, idx) => (
                          <span key={idx} className='px-2.5 py-1 bg-white text-xs font-bold border border-gray-200 text-gray-700 rounded-full shadow-sm'>
                            {cuisine}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className='pt-2'>
                      <button 
                        onClick={() => setActiveTab('edit-shop')}
                        className='w-full bg-[#ff4d2d] text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-[#ff4d2d]/20 hover:bg-[#e6391a] transition-all duration-200 active:scale-[0.98] text-sm'
                      >
                        Edit Shop Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: LIVE ORDERS TRACKER VIEW */}
          {shopInfo && activeTab === 'orders' && (
            <OrdersTracker />
          )}

          {/* TAB 3: MENU DISPLAY */}
          {shopInfo && activeTab === 'menu' && (
            <MenuList 
              menuItems={menuItems} 
              setActiveTab={setActiveTab}
              setSelectedEditItem={setSelectedEditItem}
            />
          )}

          {/* TAB 4: ADD ITEM */}
          {shopInfo && activeTab === 'add-item' && (
            <AddItemForm />
          )}

          {/* TAB 5: EDIT SHOP DETAILS RENDER VIEW */}
          {shopInfo && activeTab === 'edit-shop' && (
            <EditShopDetails />
          )}
        </div>
      </div>
      
      {selectedEditItem && (
        <EditItemModal 
          item={selectedEditItem} 
          onClose={() => setSelectedEditItem(null)} 
        />
      )}
    </div>
  );
}

export default OwnerDashboard;