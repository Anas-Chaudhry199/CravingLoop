// frontend/src/pages/Checkout.jsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/user/Navbar.jsx';
import { clearCart } from '../features/user/cart.slice.js'; 
import { IoMdArrowBack } from 'react-icons/io'; 
import { RiShieldCheckFill } from 'react-icons/ri'; // For secure badge icon
import axios from 'axios';
import toast from 'react-hot-toast';

// 💳 Stripe Imports
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// 🔑 Apni Stripe Publishable Key
const stripePromise = loadStripe(import.meta.env.VITE_STRIP_PUBLISH_KEY); 

function CheckoutFormContent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const stripe = useStripe();
  const elements = useElements();
  
  const { cartItems, totalAmount } = useSelector((state) => state.cart);
  
  // 📝 Input States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // Bill Calculations
  const deliveryFee = cartItems.length > 0 ? 100 : 0; 
  const tax = Math.round(totalAmount * 0.05); 
  const grandTotal = totalAmount + deliveryFee + tax;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return toast.error("Your basket is empty!");

    try {
      setLoading(true);

      const formattedOrderItems = cartItems.map(item => ({
        menuItem: item._id,
        quantity: item.quantity,
        priceAtOrder: item.price
      }));

      const shopId = cartItems[0]?.shop || cartItems[0]?.shopId || localStorage.getItem("currentShopId"); 

      if (!shopId) {
        return toast.error("Shop identification error. Please re-add items from the menu.");
      }

      const basePayload = {
        shop: shopId,
        orderItems: formattedOrderItems,
        totalAmount: grandTotal,
        deliveryAddress: `Receiver: ${name.trim()} | Contact: ${phone.trim()} | Address: ${address.trim()}`,
      };

      if (paymentMethod === "COD") {
        const payload = { ...basePayload, paymentMethod: "COD" };
        const response = await axios.post('/api/v1/shop/order/place', payload);

        if (response.data) {
          toast.success("Order Placed Successfully via COD! 🥡");
          finalizeOrderProcessing();
        }
      } else {
        if (!stripe || !elements) {
          toast.error("Stripe gateway is still initializing. Please wait.");
          return;
        }

        const { data } = await axios.post('/api/v1/payment/process', {
          amount: grandTotal
        });

        const clientSecret = data?.data?.clientSecret || data?.clientSecret;

        if (!clientSecret) {
          throw new Error("Unable to retrieve payment authentication signature.");
        }

        const cardElement = elements.getElement(CardElement);
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: name.trim(),
              phone: phone.trim()
            },
          },
        });

        if (result.error) {
          toast.error(result.error.message);
        } else {
          if (result.paymentIntent.status === "succeeded") {
            const payload = { 
              ...basePayload, 
              paymentMethod: "Card", 
              isPaid: true,
              paymentIntentId: result.paymentIntent.id
            };
            
            const response = await axios.post('/api/v1/shop/order/place', payload);

            if (response.data) {
              toast.success("Online Payment Successful! Order Placed 🎉");
              finalizeOrderProcessing();
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to finalize checkout dispatch loop.");
    } finally {
      setLoading(false);
    }
  };

  const finalizeOrderProcessing = () => {
    dispatch(clearCart());
    localStorage.removeItem("currentShopId");
    setTimeout(() => {
      navigate('/my-orders'); 
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left Form View Section */}
      <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs h-fit">
        <h3 className="text-base font-black text-gray-900 border-b border-gray-50 pb-3 mb-5">Delivery Details</h3>
        
        <form onSubmit={handlePlaceOrder} className="space-y-4">
          
          {/* Name Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Receiver's Name</label>
            <input 
              type="text" required placeholder="Enter full name" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full h-11 border border-gray-200 rounded-xl px-4 text-xs font-semibold text-gray-700 focus:border-[#ff4d2d] outline-none transition-all focus:bg-white bg-gray-50/50"
            />
          </div>

          {/* Phone Number Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Phone Number</label>
            <input 
              type="tel" required placeholder="e.g., 03001234567" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full h-11 border border-gray-200 rounded-xl px-4 text-xs font-semibold text-gray-700 focus:border-[#ff4d2d] outline-none transition-all focus:bg-white bg-gray-50/50"
            />
          </div>

          {/* Address Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Complete Delivery Address</label>
            <textarea 
              required rows="3" placeholder="House Number, Street No, Block or Landmark details..." value={address} onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-4 text-xs font-semibold text-gray-700 focus:border-[#ff4d2d] outline-none resize-none transition-all focus:bg-white bg-gray-50/50"
            />
          </div>

          {/* Dynamic Payment Method Selector */}
          <div className="space-y-1.5 pt-2">
            <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Select Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button" onClick={() => setPaymentMethod("COD")}
                className={`py-3.5 rounded-xl border text-xs font-black transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${paymentMethod === "COD" ? "border-[#ff4d2d] bg-orange-50/50 text-[#ff4d2d] shadow-sm shadow-orange-100" : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"}`}
              >
                <span className="text-lg">💵</span>
                Cash on Delivery
              </button>
              <button 
                type="button" onClick={() => setPaymentMethod("CARD")}
                className={`py-3.5 rounded-xl border text-xs font-black transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${paymentMethod === "CARD" ? "border-[#ff4d2d] bg-orange-50/50 text-[#ff4d2d] shadow-sm shadow-orange-100" : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"}`}
              >
                <span className="text-lg">💳</span>
                Pay Online (Stripe)
              </button>
            </div>
          </div>

          {/* 🔐 Premium Optimized Card Box Layer */}
          {paymentMethod === "CARD" && (
            <div className="space-y-2 pt-2 transition-all duration-300 ease-out">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Secure Payment Gateway</label>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <RiShieldCheckFill size={12} />
                  <span>Stripe Secure</span>
                </div>
              </div>
              
              <div className="p-4 border-2 border-orange-500/20 rounded-2xl bg-linear-to-b from-white to-gray-50/30 shadow-md shadow-orange-50/20">
                <CardElement options={{
                  style: {
                    base: {
                      fontSize: '14px',
                      color: '#1f2937',
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontWeight: '600',
                      '::placeholder': { color: '#9ca3af', fontWeight: '400' },
                    },
                    invalid: { color: '#ef4444', iconColor: '#ef4444' },
                  },
                }} />
              </div>
              <p className="text-[10px] text-gray-400 font-medium pl-1">Supports Visa, MasterCard, American Express and international routing cards.</p>
            </div>
          )}

          <button 
            type="submit" disabled={loading}
            className="w-full bg-[#ff4d2d] hover:bg-[#e03d1e] text-white text-xs font-black py-4 rounded-2xl transition-all cursor-pointer disabled:bg-gray-300 uppercase tracking-wide shadow-sm mt-4"
          >
            {loading ? "Processing Order..." : paymentMethod === "COD" ? `Confirm Cash on Delivery (Rs. ${grandTotal})` : `Authorize & Pay Securely (Rs. ${grandTotal})`}
          </button>
        </form>
      </div>

      {/* Right Summary Section */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs h-fit space-y-4">
        <h3 className="text-base font-black text-gray-900 border-b border-gray-50 pb-3">Order Summary</h3>
        
        <div className="max-h-48 overflow-y-auto space-y-3 pr-1">
          {cartItems.map((item) => (
            <div key={item._id} className="flex justify-between text-xs font-bold text-gray-700">
              <span className="truncate max-w-[70%]">{item.name} <span className="text-[#ff4d2d] ml-1">x{item.quantity}</span></span>
              <span>Rs. {item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-3 space-y-2 text-xs font-bold text-gray-500">
          <div className="flex justify-between"><span>Subtotal</span><span className="text-gray-800">Rs. {totalAmount}</span></div>
          <div className="flex justify-between"><span>Delivery Fee</span><span className="text-gray-800">Rs. {deliveryFee}</span></div>
          <div className="flex justify-between"><span>GST (5%)</span><span className="text-gray-800">Rs. {tax}</span></div>
          <div className="flex justify-between text-sm font-black text-gray-900 border-t border-gray-100 pt-3 mt-1">
            <span>Grand Total</span><span className="text-[#ff4d2d] text-base">Rs. {grandTotal}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Outer Container
function Checkout() {
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.cart);

  if (cartItems.length === 0) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Navbar />
        <span className="text-5xl">🛒</span>
        <h3 className="text-sm font-bold text-gray-700 mt-4">Your cart is empty</h3>
        <button onClick={() => navigate('/')} className="mt-3 text-xs font-black bg-[#ff4d2d] text-white px-5 py-2.5 rounded-xl cursor-pointer">Go Shop Now</button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-20 select-none">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 pt-24">
        
        {/* Premium Go Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="mb-4 flex items-center gap-2 text-xs font-black text-gray-600 hover:text-[#ff4d2d] transition-colors cursor-pointer bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-xs"
        >
          <IoMdArrowBack size={16} />
          Go Back
        </button>

        <Elements stripe={stripePromise}>
          <CheckoutFormContent />
        </Elements>

      </div>
    </div>
  );
}

export default Checkout;