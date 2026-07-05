import React, { useState } from 'react'
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import toast from 'react-hot-toast'; 
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'; 
import { useDispatch } from 'react-redux';
import { setUser } from '../features/user/user.Slice';
import { auth } from '../../utils/firebaseAuth';

function SignIn() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const dispatch = useDispatch();
  const navigate = useNavigate(); 

  // 1. Regular Credentials Sign In Handler
  const handleSignIn = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill all the fields");
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.post("/api/v1/auth/SignIn", {
        email,
        password
      });

      if (response.data?.success) {
        const userData = response.data?.data?.user || response.data?.data;
        dispatch(setUser(userData));

        toast.success("Login Successful! Welcome back", {
          duration: 2000,
          position: 'top-center'
        });
        
        // ⏱️ Safe transition delay target
        setTimeout(() => {
          toast.dismiss(); 
          navigate("/"); 
        }, 1200);
      }
      console.log(response?.data);
      
    } catch (error) {
      console.error("Login Error:", error);
      toast.error(error.response?.data?.message || "Invalid Email or Password");
    } finally {
      setLoading(false);
    }
  }

  // 2. Google OAuth Sign In Handler
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true); 
      const provider = new GoogleAuthProvider();
      
      const result = await signInWithPopup(auth, provider);
      const { displayName, email: googleEmail } = result.user;

      const response = await axios.post("/api/v1/auth/Google-Authentication", {
        fullName: displayName, 
        email: googleEmail
      });

      if (response.data?.success) {
        const userData = response.data?.data?.user || response.data?.data;
        dispatch(setUser(userData));

        toast.success("Login Successful!", {
          duration: 2000,
          position: 'top-center'
        });

        // ⏱️ Safe transition delay target
        setTimeout(() => {
          toast.dismiss();
          navigate("/"); 
        }, 1200);
      }
      
    } catch (error) {
      console.error("Google Sign In Error:", error);
      toast.error("Google Sign In Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-4 w-full bg-bg-dark text-slate-800'>
      {/* 🚀 Note: Local <Toaster /> removed successfully to clean global stream */}
      <div className="bg-card-dark border border-border-dark p-8 rounded-2xl w-full max-w-md shadow-xl">

        {/* Brand Name */}
        <h1 className='text-3xl font-bold mb-2 text-primary'>CravingLoop</h1>
        <p className='text-slate-500 text-sm mb-8'>Log in to your account to order delicious food</p>

        <form onSubmit={handleSignIn} className="space-y-4">
          
          {/* Email */}
          <div>
            <label htmlFor="email" className='block text-slate-700 font-medium mb-1 text-sm'>Email Address</label>
            <input 
              type="email" 
              className='w-full bg-slate-50 border border-border-dark rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-slate-400 text-sm' 
              placeholder='Enter your email' 
              onChange={(e) => setEmail(e.target.value)}  
              value={email}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className='block text-slate-700 font-medium mb-1 text-sm'>Password</label>
            <div className='relative'>
              <input 
                type={showPassword ? "text" : "password"} 
                className='w-full bg-slate-50 border border-border-dark rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-slate-400 text-sm pr-10' 
                placeholder='Enter your Password' 
                onChange={(e) => setPassword(e.target.value)}  
                value={password}
                required
              />
              <button
                type="button"
                className='absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer text-lg'
                onClick={() => setShowPassword(pre => !pre)}
              >
                {!showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </button>
            </div>
            
            {/* Forget Password Link */}
            <div 
              className='text-primary text-right text-xs font-semibold hover:underline cursor-pointer mt-2'
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </div>
          </div>

          {/* Main Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className='w-full mt-4 bg-primary hover:bg-primary-hover disabled:bg-orange-300 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-orange-500/10 transition-all cursor-pointer text-sm disabled:cursor-not-allowed'
          >
            {loading ? "Logging In..." : "Log In"}
          </button>

          {/* Divider */}
          <div className="flex items-center my-4 before:flex-1 before:border-t before:border-border-dark after:flex-1 after:border-t after:border-border-dark">
            <p className="text-center font-medium text-xs text-slate-400 px-3">OR</p>
          </div>

          {/* Google Button */}
          <button 
            type="button" 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className='w-full justify-center flex items-center gap-2 border bg-slate-50 border-border-dark hover:bg-slate-100 rounded-xl px-3 py-3 text-slate-700 shadow-sm transition-all cursor-pointer text-sm font-medium disabled:cursor-not-allowed'
          >
            <FcGoogle size={20}/>
            <span>Sign in with Google</span>
          </button>

          {/* Footer Link */}
          <p className='text-center mt-6 text-xs text-slate-500'>
            Don't have an account?{' '}
            <span 
              className='text-primary hover:underline font-semibold cursor-pointer ml-1'
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </span>
          </p>

        </form>
      </div>
    </div>
  )
}

export default SignIn;