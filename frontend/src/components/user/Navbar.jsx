import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { clearUser } from '../../features/user/user.Slice.js'
import { FaLocationDot } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import { IoCartOutline, IoFastFoodOutline } from "react-icons/io5"; // 👈 IoFastFoodOutline yahan add kar diya
import { RxCross2 } from "react-icons/rx"; 
import { FiLogIn } from "react-icons/fi"; 
import axios from 'axios'
import toast from 'react-hot-toast'
import CartDrawer from './CartDrawer.jsx';

function Navbar({ searchQuery = '', setSearchQuery = () => {} }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const { user, city } = useSelector((state) => state.user)
  // 🛒 Global Redux memory se items counter fetch kar liya runtime ke liye
  const totalQuantity = useSelector((state) => state.cart?.totalQuantity || 0);
  
  const [showInfo, setShowInfo] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false) // 🚀 Cart side drawer open/close toggle state

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const shouldShowSearch = !user || user.role === 'user';
  const isCustomer = !user || user.role === 'user';

  const handleLogout = async () => {
    try {
      await axios.post('/api/v1/auth/SignOut')
      dispatch(clearUser())
      toast.success("Logged out successfully!")
      navigate('/signin')
    } catch (error) {
      console.error("Logout Error:", error)
      toast.error("Failed to logout.")
    }
  }

  return (
    <>
      <div className={`w-full h-20 flex items-center justify-between gap-4 px-4 md:px-6 fixed top-0 z-99 select-none transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100' : 'bg-[#fff9f6]'
      }`}>

        {/* 1. Logo Section (Always Left - Brand Matched with Footer) */}
        <div className="flex items-center cursor-pointer active:scale-98 transition-transform shrink-0" onClick={() => navigate('/')}>
          <div className="flex items-center gap-2 text-[#ff4d2d]">
            <IoFastFoodOutline size={28} className="stroke-[2.5]" />
            <span className="text-xl md:text-2xl font-black tracking-wide text-gray-800">
              Craving<span className="text-[#ff4d2d]">Loop</span>
            </span>
          </div>
        </div>

        {/* 2. Middle Section: Desktop Search Bar */}
        {shouldShowSearch && (
          <div className="hidden md:flex flex-1 max-w-xl h-11 bg-white border border-gray-200 rounded-2xl items-center px-4 gap-3 shadow-xs mx-auto">
            <div className='flex items-center gap-1.5 border-r border-gray-200 pr-3 shrink-0 max-w-30'>
              <FaLocationDot size={15} className='text-[#ff4d2d]' />
              <span className='truncate text-xs font-bold text-gray-600'>{!user ? "Loading.." : city || "Pakistan"}</span>
            </div>

            <div className='flex items-center flex-1 gap-2'>
              <IoIosSearch size={20} className='text-gray-400' />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search delicious food...'
                className='text-xs font-semibold text-gray-700 outline-none w-full bg-transparent placeholder:text-gray-400'
              />
            </div>
          </div>
        )}

        {/* 3. Mobile Search Dropdown Popup */}
        {shouldShowSearch && showSearch && (
          <div className='absolute top-20 left-0 w-full bg-white px-5 py-3 shadow-lg md:hidden z-98 flex items-center gap-2 border-b border-gray-100 animate-fadeIn'>
            <div className='flex items-center gap-1 border-r border-gray-200 pr-2 shrink-0 max-w-25'>
              <FaLocationDot size={13} className='text-[#ff4d2d]' />
              <span className='truncate text-[11px] font-bold text-gray-500'>{!user ? "..." : city}</span>
            </div>
            
            <div className='flex items-center flex-1 gap-2'>
              <IoIosSearch size={18} className='text-gray-400' />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search food...'
                className='text-xs font-semibold text-gray-700 outline-none w-full bg-transparent'
              />
            </div>
          </div>
        )}

        {/* 4. Right Section */}
        <div className='flex items-center gap-2 md:gap-4 shrink-0 ml-auto md:ml-0'>
          {/* Mobile Search Icon Trigger */}
          {shouldShowSearch && (
            <div className='md:hidden cursor-pointer p-2 rounded-xl hover:bg-gray-100 transition-colors'>
              {showSearch ? (
                <RxCross2 size={22} className='text-gray-600' onClick={() => setShowSearch(false)} />
              ) : (
                <IoIosSearch size={22} className='text-gray-700' onClick={() => setShowSearch(true)} />
              )}
            </div>
          )}
          
          {/* 🟢 Cart Icon */}
          {isCustomer && (
            <div 
              className='relative cursor-pointer p-2 rounded-xl hover:bg-gray-100 transition-colors' 
              onClick={() => setIsCartOpen(true)}
            >
              <IoCartOutline size={25} className='text-gray-800 hover:text-[#ff4d2d] transition-colors' />
              
              {totalQuantity > 0 && (
                <span className='absolute right-0.5 top-0.5 text-white text-[9px] font-black bg-[#ff4d2d] w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs border border-white animate-pulse'>
                  {totalQuantity}
                </span>
              )}
            </div>
          )}

          {/* My Orders desktop action */}
          {user && isCustomer && (
            <button 
              onClick={() => navigate('/my-orders')}
              className='hidden md:block px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition-all active:scale-95 cursor-pointer'
            >
              My Orders
            </button>
          )}

          {/* Auth Handler Group */}
          {user ? (
            <div className='relative'>
              <div 
                className='w-9 h-9 rounded-xl flex items-center justify-center bg-linear-to-tr from-[#ff4d2d] to-orange-500 text-white text-sm shadow-md font-bold cursor-pointer active:scale-95 transition-transform'
                onClick={() => setShowInfo(prev => !prev)}
              >
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>

              {showInfo && (
                <div className='absolute top-12 right-0 w-48 bg-white shadow-xl rounded-2xl p-4 flex flex-col gap-2.5 z-999 border border-gray-100/80 animate-fadeIn text-left'>
                  <div className='text-xs font-black text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-1.5 max-w-full truncate'>
                    Hi, {user?.fullName?.split(' ')[0] || 'Craver'} 👋
                  </div>
                  
                  {isCustomer && (
                    <div 
                      onClick={() => { setShowInfo(false); navigate('/my-orders'); }}
                      className='md:hidden text-gray-600 hover:text-[#ff4d2d] text-xs font-bold cursor-pointer transition-colors py-1'
                    >
                      My Orders
                    </div>
                  )}
                  
                  <div 
                    onClick={handleLogout} 
                    className='text-rose-600 hover:text-rose-700 text-xs font-black cursor-pointer transition-colors pt-1 border-t border-gray-50'
                  >
                    Log Out
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/signin')}
              className='flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl bg-[#ff4d2d] text-white text-xs font-bold hover:bg-[#e03a1b] shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer'
            >
              <FiLogIn size={14} />
              <span className='hidden sm:inline'>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* 🚀 Injecting the side slider portal element stack */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}

export default Navbar;