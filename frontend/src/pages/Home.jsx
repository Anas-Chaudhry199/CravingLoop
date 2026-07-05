// frontend/src/pages/Home.jsx
import React from 'react'
import { useSelector } from 'react-redux' 
import UserDashboard from '../components/UserDashboard.jsx'
import OwnerDashboard from '../components/OwnerDashboard.jsx'
import DeliveryDashboard from '../components/DeliveryDashboard.jsx' // 👈 Path correct kiya structural layout ke mutabiq

function Home() {
  const { user } = useSelector((state) => state.user)

  // 🌍 Agar user login nahi hai (Guest user hai), toh use default shop/outlet browser interface dikhao
  if (!user) {
    return <UserDashboard />
  }

  // 🔐 Agar user login hai, toh uske role ke mutabiq bina routing delay ke direct dashboard inject karo
  return (
    <div className="w-full min-h-screen bg-[#fffcfb]">
      {user.role === "user" && <UserDashboard />}
      {user.role === "owner" && <OwnerDashboard />}
      {user.role === "deliveryBoy" && <DeliveryDashboard />}
    </div>
  )
}

export default Home;