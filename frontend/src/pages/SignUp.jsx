import React, { useState } from 'react'
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import toast, { Toaster } from 'react-hot-toast';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../utils/firebaseAuth';
import { useDispatch } from 'react-redux';
import { setUser } from '../features/user/user.Slice';

function SignUp() {
  const [showPassword, setShowPassword] = useState(false)
  const [fullName, setfullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mobile, setMobile] = useState("")
  const [role, setRole] = useState("user")
  const [loading, setLoading] = useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!fullName || !email || !password || !mobile) {
      toast.error("Please fill all the fields");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("/api/v1/auth/SignUp", {
        fullName,
        email,
        password,
        mobile,
        role
      });

      if (response.data?.success) {
        toast.success("Registration Successfully");

        // ⏱️ 1.5 Seconds ka delay diya hai taake toast stuck na ho aur page smooth redirect ho
        setTimeout(() => {

          navigate("/signin");
        }, 2000);
      }

    } catch (error) {
      console.error("Signup Error:", error);
      const errorMessage = error.response?.data?.message || "Something went wrong during signup";
      toast.error(errorMessage)
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleAuth = async () => {
    if (!mobile) {
      toast.error("Please enter your Mobile Number before signing up with Google");
      return;
    }
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const firebaseUser = result.user

      const payload = {
        fullName: firebaseUser.displayName,
        email: firebaseUser.email,
        mobile: mobile,
        role: role
      }

      toast.loading("Authenticating with Google...", { id: "googleAuth" });

      const response = await axios.post("/api/v1/auth/Google-Authentication", payload);

      if (response.status === 200 && response.data?.success) {
        toast.success("Google Login Successful! ", { id: "googleAuth" });

        dispatch(setUser(response.data.user))

        if (response.data?.role === "owner") {
          navigate("/dashboard")
        } else {
          navigate("/");
        }
      }

    } catch (error) {
      console.error("Google Auth Error:", error);
      toast.error(error.response?.data?.message || "Google Authentication Failed!", { id: "googleAuth" });
    }
  }

  return (
    <>

      <Toaster position="top-center" reverseOrder={false} />
      <div className='min-h-screen flex items-center justify-center p-4 w-full bg-bg-dark text-slate-800'>
        <div className="bg-card-dark border border-border-dark p-8 rounded-2xl w-full max-w-md shadow-xl">

          {/* Brand Name */}
          <h1 className='text-3xl font-bold mb-2 text-primary'>CravingLoop</h1>
          <p className='text-slate-500 text-sm mb-8'>Create your account to get started with delicious food deliveries</p>

          <form onSubmit={handleSignUp} className="space-y-4">

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className='block text-slate-700 font-medium mb-1 text-sm'>Full Name</label>
              <input
                type="text"
                className='w-full bg-slate-50 border border-border-dark rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-slate-400 text-sm'
                placeholder='Enter your Full Name'
                onChange={(e) => setfullName(e.target.value)}
                value={fullName}
                required
              />
            </div>

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

            {/* Mobile Number */}
            <div>
              <label htmlFor="mobile" className='block text-slate-700 font-medium mb-1 text-sm'>Mobile Number</label>
              <input
                type="number"
                className='w-full bg-slate-50 border border-border-dark rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-slate-400 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                placeholder='Enter your Mobile Number'
                onChange={(e) => setMobile(e.target.value)}
                value={mobile}
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
            </div>

            {/* User Role Buttons */}
            <div>
              <label className='block text-slate-700 font-medium mb-2 text-sm'>Register As</label>
              <div className='flex gap-2'>
                {[
                  { id: "user", label: "Customer" },
                  { id: "owner", label: "Owner" },
                  { id: "deliveryBoy", label: "Rider" }
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`flex-1 border rounded-lg px-3 py-2 font-medium transition-colors text-xs cursor-pointer
                    ${role === r.id
                        ? 'bg-primary border-primary text-white shadow-md font-semibold'
                        : 'border-border-dark text-slate-500 bg-slate-50 hover:bg-white hover:text-slate-800 hover:border-slate-400'
                      }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className='w-full mt-4 bg-primary hover:bg-primary-hover disabled:bg-orange-300 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-orange-500/10 transition-all cursor-pointer text-sm disabled:cursor-not-allowed'
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            {/* Divider */}
            <div className="flex items-center my-4 before:flex-1 before:border-t before:border-border-dark after:flex-1 after:border-t after:border-border-dark">
              <p className="text-center font-medium text-xs text-slate-400 px-3">OR</p>
            </div>

            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              className='w-full justify-center flex items-center gap-2 border bg-slate-50 border-border-dark hover:bg-slate-100 rounded-xl px-3 py-3 text-slate-700 shadow-sm transition-all cursor-pointer text-sm font-medium'
            >
              <FcGoogle size={20} />
              <span>Sign up with Google</span>
            </button>

            {/* Footer Link */}
            <p className='text-center mt-6 text-xs text-slate-500'>
              Already have an account?{' '}
              <span
                className='text-primary hover:underline font-semibold cursor-pointer ml-1'
                onClick={() => navigate("/signin")}
              >
                Sign In
              </span>
            </p>

          </form>
        </div>
      </div>
    </>
  )
}

export default SignUp