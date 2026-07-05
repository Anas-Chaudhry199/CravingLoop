// frontend/src/App.jsx
import React, { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from "react-redux"
import { fetchCurrentUser } from './features/user/user.Slice.js'

import SignUp from "./pages/SignUp"
import SignIn from "./pages/SignIn"
import ForgotPassword from './pages/ForgotPassword'
import Home from './pages/Home' 
import ShopMenu from './pages/ShopMenu' 
import Checkout from './pages/Checkout' 
import DeliveryDashboard from './components/DeliveryDashboard.jsx' // 👈 Delivery Dashboard Import Kiya

import useGetLocation from '../utils/useGetLoaction.js'
import UserDashboard from './components/UserDashboard.jsx'
import { Toaster } from 'react-hot-toast'
import MyOrders from './pages/MyOrders.jsx'
import Footer from './components/common/Footer.jsx' 

function App() {
  useGetLocation()
  const dispatch = useDispatch()
  const location = useLocation()

  const { user, loading } = useSelector((state) => state.user)

  useEffect(() => {
    dispatch(fetchCurrentUser())
  }, [dispatch])

  if (loading) return <div className="flex h-screen items-center justify-center">Loading CravingLoop...</div>

  // 🔐 Check karein ke user auth pages par toh nahi hai? (Auth pages par footer hide ho jayega)
  const hideFooterRoutes = ['/signup', '/signin', '/forgot-password'];
  const showFooter = !hideFooterRoutes.includes(location.pathname);

  return (
    // 🟢 Flex structure lagaya taake footer hamesha bottom par stick rahe
    <div className="flex flex-col min-h-screen bg-[#fffcfb]">
      <Toaster />
      
      {/* Dynamic Content Window */}
      <div className="grow">
        <Routes>
          {/* 🔐 1. Authentication Routes */}
          <Route path='/signup' element={!user ? <SignUp /> : <Navigate to="/" />} />
          <Route path='/signin' element={!user ? <SignIn /> : <Navigate to="/" />} />
          <Route path='/forgot-password' element={!user ? <ForgotPassword /> : <Navigate to="/" />} />

          {/* 🌍 2. Public / Role-Based Routes */}
          <Route path='/' element={<Home />} /> 
          <Route path='/shop/:shopId' element={<ShopMenu />} />

          {/* 🛡️ 3. Protected Routes */}
          <Route
            path='/checkout'
            element={user ? <Checkout /> : <Navigate to="/signin" state={{ from: location }} replace />}
          />

          {/* 📦 Customer Order History Route */}
          <Route
            path='/my-orders'
            element={user ? <MyOrders /> : <Navigate to="/signin" state={{ from: location }} replace />}
          />

          {/* 🚴 4. NAYA ROUTE: Delivery Boy Portal */}
          <Route
            path='/delivery/dashboard'
            element={
              user && user.role === 'deliveryBoy' ? (
                <DeliveryDashboard />
              ) : (
                <Navigate to="/signin" state={{ from: location }} replace />
              )
            }
          />

          {/* Fallback */}
          <Route path='*' element={<Navigate to="/" />} />
        </Routes>
      </div>

      {/* 🎯 5. Global Footer Component (Sirf Tabhi dikhega jab user login/signup par na ho) */}
      {showFooter && <Footer />}
    </div>
  )
}

export default App;