import React, { useState } from 'react'
import { FaRegEye, FaRegEyeSlash, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import toast, { Toaster } from 'react-hot-toast'; 

export default function ForgotPassword() {
  const [step, setStep] = useState(1) 
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    //STEP 1: Send OTP to Email
    if (step === 1) {
      if (!email) return toast.error("Please enter your email"); 
      try {
        setLoading(true);
        const response = await axios.post("/api/v1/auth/SendOTP", { email });
        
        if (response.status === 200) {
          toast.success("6-Digit OTP sent to your email! 📩");
          setStep(2); 
        } else {
          toast.error("Failed to send OTP");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to send OTP");
      } finally {
        setLoading(false);
      }
    } 
    
    // STEP 2: Verify OTP
    else if (step === 2) {
      if (!otp || otp.length !== 6) return toast.error("Please enter a valid 6-digit OTP"); // 🔥 FIX: toast.error used
      try {
        setLoading(true);
        const response = await axios.post("/api/v1/auth/VerifyOTP", { email, otp });
      
        if (response.status === 200) {
          toast.success("OTP Verified Successfully! 🎉");
          setStep(3); 
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Invalid or Expired OTP");
      } finally {
        setLoading(false);
      }
    } 
    
    // STEP 3: Reset Password
    else if (step === 3) {
      if (!password) return toast.error("Please enter your new password"); // 🔥 FIX: toast.error used
      try {
        setLoading(true);
        const response = await axios.post("/api/v1/auth/ResetPassword", { email, password });
        
        if (response.status === 200) {
          toast.success("Password updated successfully! Welcome back");
          navigate("/signin");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to reset password");
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div className='flex w-full items-center justify-center min-h-screen p-4 bg-bg-dark text-slate-800'>
      {/* 🟢 Toaster container added so notifications actually pop up */}
      <Toaster position="top-center" reverseOrder={false} />

      <div className='bg-card-dark border border-border-dark rounded-2xl shadow-xl w-full max-w-md p-8'>
        
        {/* Header Back Button & Title */}
        <div className='flex items-center gap-4 mb-6'>
          <button 
            type="button"
            onClick={() => step > 1 ? setStep(step - 1) : navigate("/signin")}
            className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <FaArrowLeft size={18} />
          </button>
          <h2 className='text-2xl font-bold text-primary'>
            {step === 1 && "Forgot Password"}
            {step === 2 && "Enter OTP"}
            {step === 3 && "New Password"}
          </h2>
        </div>

        <p className='text-slate-500 text-sm mb-6'>
          {step === 1 && "Enter your registered email to receive a 6-digit verification code."}
          {step === 2 && `We've sent a 6-digit code to ${email}`}
          {step === 3 && "Set your new secure password to log into your account."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* STEP 1: Email Input */}
          {step === 1 && (
            <div>
              <label className='block text-slate-700 font-medium mb-1 text-sm'>Email Address</label>
              <input
                type="email"
                className='w-full bg-slate-50 border border-border-dark rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary text-sm'
                placeholder='name@example.com'
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
              />
            </div>
          )}

          {/* STEP 2: OTP Input */}
          {step === 2 && (
            <div>
              <label className='block text-slate-700 font-medium mb-1 text-sm'>6-Digit Verification Code</label>
              <input
                type="text"
                maxLength={6}
                className='w-full bg-slate-50 border border-border-dark rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary text-center text-lg font-bold tracking-widest'
                placeholder='000000'
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                value={otp}
                required
              />
            </div>
          )}

          {/* STEP 3: New Password Input */}
          {step === 3 && (
            <div>
              <label className='block text-slate-700 font-medium mb-1 text-sm'>New Password</label>
              <div className='relative'>
                <input
                  type={showPassword ? "text" : "password"}
                  className='w-full bg-slate-50 border border-border-dark rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary text-sm pr-10'
                  placeholder='Enter new password'
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  required
                />
                <button
                  type="button"
                  className='absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-lg'
                  onClick={() => setShowPassword(pre => !pre)}
                >
                  {!showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className='w-full mt-4 bg-primary hover:bg-primary-hover disabled:bg-orange-300 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all cursor-pointer text-sm'
          >
            {loading ? "Processing..." : 
             step === 1 ? "Send Code" : 
             step === 2 ? "Verify Code" : "Update Password"}
          </button>

        </form>
      </div>
    </div>
  )
}