import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { IoMdClose } from 'react-icons/io';
import { FaTrashCan, FaPlus, FaMinus } from 'react-icons/fa6';
import { addToCart, decreaseQuantity, removeFromCart } from '../../features/user/cart.slice.js'; // path correct rakhain
import toast from 'react-hot-toast';

function CartDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 🛒 Global States Fetch
  const { cartItems, totalAmount } = useSelector((state) => state.cart || { cartItems: [], totalAmount: 0 });
  const { user } = useSelector((state) => state.user || {}); // Auth status verification

  if (!isOpen) return null;

  const handleCheckoutGate = () => {
    if (cartItems.length === 0) return;

    // 🔐 Gatekeeper Protection Constraint Check
    if (!user) {
      toast.error("Please login to proceed with your order!", {
        style: { fontWeight: 'bold' }
      });
      onClose(); // Drawer close karo
      navigate('/login'); // Redirect to login
      return;
    }

    // Success route transition
    onClose();
    navigate('/checkout'); // Order status dashboard flow
  };

  return (
    <div className="fixed inset-0 z-50 select-none">
      {/* Dark backdrop shadow backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />

      {/* Dynamic Slide Drawer body */}
      <div className="absolute top-0 right-0 w-full sm:w-105 h-full bg-white shadow-2xl flex flex-col animate-slide-in">
        
        {/* Header segment */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-gray-800">My Basket</h3>
            <p className="text-[11px] text-gray-400 font-bold">{cartItems.length} items added</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors">
            <IoMdClose size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Dynamic Mid Section Items Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.map((item) => (
            <div key={item._id} className="flex items-center justify-between gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 shrink-0">
                <img src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150"} alt={item.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 space-y-1">
                <h4 className="text-xs font-black text-gray-800 line-clamp-1">{item.name}</h4>
                <p className="text-xs font-black text-gray-900">Rs. {item.price}</p>
                
                {/* Plus Minus Controls */}
                <div className="flex items-center gap-3 pt-1">
                  <button onClick={() => dispatch(decreaseQuantity(item._id))} className="w-6 h-6 border border-gray-200 bg-white flex items-center justify-center rounded-lg active:scale-90 transition-all cursor-pointer">
                    <FaMinus size={9} className="text-gray-500" />
                  </button>
                  <span className="text-xs font-black text-gray-800">{item.quantity}</span>
                  <button onClick={() => dispatch(addToCart(item))} className="w-6 h-6 border border-gray-200 bg-white flex items-center justify-center rounded-lg active:scale-90 transition-all cursor-pointer">
                    <FaPlus size={9} className="text-[#ff4d2d]" />
                  </button>
                </div>
              </div>

              {/* Trash button */}
              <button onClick={() => dispatch(removeFromCart(item._id))} className="text-gray-400 hover:text-rose-500 p-2 cursor-pointer transition-colors">
                <FaTrashCan size={13} />
              </button>
            </div>
          ))}

          {/* Empty state context layer */}
          {cartItems.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center pb-20">
              <span className="text-5xl">🛒</span>
              <h4 className="text-sm font-black text-gray-700 mt-4">Your basket is clear</h4>
              <p className="text-xs text-gray-400 max-w-xs mt-1">Kuch laziz items select karain taake loop agge chal sake bahi.</p>
            </div>
          )}
        </div>

        {/* Footer Checkout action bar */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-gray-100 space-y-3 bg-white">
            <div className="flex items-center justify-between text-gray-800">
              <span className="text-xs font-black text-gray-400 uppercase">Subtotal Amount</span>
              <span className="text-lg font-black">Rs. {totalAmount}</span>
            </div>
            
            <button 
              onClick={handleCheckoutGate}
              className="w-full bg-[#ff4d2d] hover:bg-[#e03d1e] text-white text-xs font-black py-3.5 rounded-2xl shadow-sm hover:shadow transition-all text-center active:scale-[0.99] cursor-pointer tracking-wider uppercase"
            >
              Proceed to Checkout
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default CartDrawer;