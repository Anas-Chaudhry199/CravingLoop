import React from 'react';
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn, FaPlay, FaApple, FaMailBulk } from 'react-icons/fa';
import { CiMail } from "react-icons/ci";
import { IoFastFoodOutline } from 'react-icons/io5';

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-white border-t border-gray-100 font-sans mt-auto">
            {/* Main Footer Container */}
            <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">

                {/* Column 1: Brand Logo & Socials */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-[#ff4d2d]">
                        <IoFastFoodOutline size={28} className="stroke-[2.5]" />
                        <span className="text-xl font-black tracking-wide text-gray-800">
                            Craving<span className="text-[#ff4d2d]">Loop</span>
                        </span>
                    </div>
                    <p className="text-sm font-medium text-gray-500 leading-relaxed">
                        Pakistan's fastest food delivery network. Bringing your favorite meals from local kitchens straight to your doorstep in minutes.
                    </p>

                    {/* Social Media Links */}
                    <div className="flex items-center gap-3 mt-2">
                        <a href="#" className="p-2.5 bg-gray-50 hover:bg-[#ff4d2d]/10 text-gray-600 hover:text-[#ff4d2d] rounded-xl transition-all duration-200">
                            <FaFacebookF size={16} />
                        </a>
                        <a
                            href="mailto:anas.ch199786@gmail.com"
                            className="p-2.5 bg-gray-50 hover:bg-[#ff4d2d]/10 text-gray-600 hover:text-[#ff4d2d] rounded-xl transition-all duration-200"
                        >
                            <CiMail size={16} />
                        </a>
                        <a href="#" className="p-2.5 bg-gray-50 hover:bg-[#ff4d2d]/10 text-gray-600 hover:text-[#ff4d2d] rounded-xl transition-all duration-200">
                            <FaTwitter size={16} />
                        </a>
                        {/* 🟢 LinkedIn Profile Link Integrated Here */}
                        <a
                            href="https://www.linkedin.com/in/anas-shakeel1/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 bg-gray-50 hover:bg-[#ff4d2d]/10 text-gray-600 hover:text-[#ff4d2d] rounded-xl transition-all duration-200"
                        >
                            <FaLinkedinIn size={16} />
                        </a>
                    </div>
                </div>

                {/* Column 2: Customers */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">For Customers</h3>
                    <ul className="flex flex-col gap-2.5 text-sm font-semibold text-gray-600">
                        <li><a href="#" className="hover:text-[#ff4d2d] transition-colors">Search Restaurants</a></li>
                        <li><a href="#" className="hover:text-[#ff4d2d] transition-colors">Track Your Order</a></li>
                        <li><a href="#" className="hover:text-[#ff4d2d] transition-colors">Privacy Policy</a></li>
                        <li><a href="#" className="hover:text-[#ff4d2d] transition-colors">Terms of Service</a></li>
                    </ul>
                </div>

                {/* Column 3: For Partners */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Our Partnerships</h3>
                    <ul className="flex flex-col gap-2.5 text-sm font-semibold text-gray-600">
                        <li><a href="#" className="hover:text-[#ff4d2d] transition-colors">Register Your Shop</a></li>
                        <li><a href="#" className="hover:text-[#ff4d2d] transition-colors">Join as a Rider</a></li>
                        <li><a href="#" className="hover:text-[#ff4d2d] transition-colors">Merchant Dashboard</a></li>
                        <li><a href="#" className="hover:text-[#ff4d2d] transition-colors">Help Center</a></li>
                    </ul>
                </div>

                {/* Column 4: App Downloads */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Experience Web App</h3>
                    <p className="text-xs font-medium text-gray-400 -mt-2 leading-relaxed">
                        Get the best user experience on our official iOS and Android applications.
                    </p>
                    <div className="flex flex-col gap-2.5">
                        {/* Play Store */}
                        <a href="#" className="flex items-center gap-3 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl transition-colors shadow-xs">
                            <FaPlay size={18} className="text-white" />
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-[10px] font-medium text-gray-400 uppercase">Get it on</span>
                                <span className="text-sm font-bold mt-0.5">Google Play</span>
                            </div>
                        </a>
                        {/* App Store */}
                        <a href="#" className="flex items-center gap-3 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl transition-colors shadow-xs">
                            <FaApple size={20} className="text-white" />
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-[10px] font-medium text-gray-400 uppercase">Download on the</span>
                                <span className="text-sm font-bold mt-0.5">App Store</span>
                            </div>
                        </a>
                    </div>
                </div>

            </div>

            {/* Bottom Bar: Copyright */}
            <div className="w-full border-t border-gray-100 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-gray-400">
                    <p>© {currentYear} CravingLoop Private Ltd. All rights reserved.</p>
                    <p className="tracking-wide">Developed By Anas Shakeel</p>
                </div>
            </div>

        </footer>
    );
}

export default Footer;