import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom'; // 🟢 UPDATED: URL params read karne ke liye import kiya
import { addItemToMenu } from '../../features/user/shopMenu.slice.js'; 
import { FiPlusCircle } from "react-icons/fi";
import toast from 'react-hot-toast';

export default function AddItemForm() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams(); // 👈 URL configurations check karne ke liye hook initialized

  // Local Component States
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category: '', isAvailable: true });
  const [itemImage, setItemImage] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setItemImage(e.target.files[0]);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // 🟢 SECURE RE-ROUTE: Redux state ke bajaye pehle directly URL params check karo ke item kis shop mein jana hai
    const targetShopId = searchParams.get('shopId');

    if (!targetShopId) {
      return toast.error("Please select a specific restaurant from the dropdown pool first.");
    }

    if (!itemImage) {
      return toast.error("Please upload a food item image.");
    }

    const toastId = toast.loading('Uploading assets to Cloudinary...');
    
    try {
      setFormSubmitting(true);

      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('isAvailable', formData.isAvailable);
      data.append('image', itemImage);

      // 🟢 CRITICAL SYNC: Target URL parameter wali shopId bhej di
      const resultAction = await dispatch(addItemToMenu({ shopId: targetShopId, formData: data })).unwrap();

      if (resultAction?.success || resultAction) {
        toast.success('Item added to your menu successfully!', { id: toastId });
        
        // Form states clear loop
        setFormData({ name: '', description: '', price: '', category: '', isAvailable: true });
        setItemImage(null);
        e.target.reset();
      }
    } catch (err) {
      console.error("Form transmission failure:", err);
      const errorMessage = typeof err === 'string' ? err : (err?.message || 'Error encountered while adding the menu item.');
      toast.error(errorMessage, { id: toastId });
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className='max-w-xl bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-sm border border-gray-100'>
      <div className='mb-4 md:mb-6'>
        <h2 className='text-lg md:text-xl font-extrabold text-gray-800 tracking-wide'>Add New Food Item</h2>
        <p className='text-xs font-semibold text-gray-400 mt-1'>CravingLoop dynamic menu card setup</p>
      </div>

      <form onSubmit={handleFormSubmit} className='flex flex-col gap-4'>
        <div className='flex flex-col gap-1.5'>
          <label className='text-xs font-bold uppercase tracking-wider text-gray-400'>Food Item Name *</label>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g., Special Chicken Biryani" className='w-full bg-gray-50 border border-gray-100 focus:border-[#ff4d2d]/30 focus:bg-white text-sm font-medium px-4 py-2.5 md:py-3 rounded-xl outline-none transition-all' />
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div className='flex flex-col gap-1.5'>
            <label className='text-xs font-bold uppercase tracking-wider text-gray-400'>Category *</label>
            <input type="text" name="category" value={formData.category} onChange={handleInputChange} required placeholder="e.g., Desi, Fast Food" className='w-full bg-gray-50 border border-gray-100 focus:border-[#ff4d2d]/30 focus:bg-white text-sm font-medium px-4 py-2.5 md:py-3 rounded-xl outline-none transition-all' />
          </div>
          <div className='flex flex-col gap-1.5'>
            <label className='text-xs font-bold uppercase tracking-wider text-gray-400'>Price (Rs.) *</label>
            <input type="number" name="price" value={formData.price} onChange={handleInputChange} required placeholder="e.g., 350" className='w-full bg-gray-50 border border-gray-100 focus:border-[#ff4d2d]/30 focus:bg-white text-sm font-medium px-4 py-2.5 md:py-3 rounded-xl outline-none transition-all' />
          </div>
        </div>

        <div className='flex flex-col gap-1.5'>
          <label className='text-xs font-bold uppercase tracking-wider text-gray-400'>Description</label>
          <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" placeholder="Describe your dish taste..." className='w-full bg-gray-50 border border-gray-100 focus:border-[#ff4d2d]/30 focus:bg-white text-sm font-medium px-4 py-2.5 md:py-3 rounded-xl outline-none transition-all resize-none' />
        </div>

        <div className='flex flex-col gap-1.5'>
          <label className='text-xs font-bold uppercase tracking-wider text-gray-400'>Food Image *</label>
          <div className='w-full relative flex items-center justify-center border border-gray-200 rounded-xl bg-gray-50 p-4 hover:bg-gray-100/50 transition-colors cursor-pointer'>
            <input type="file" accept="image/*" required={!formData.name} onChange={handleFileChange} className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10' />
            <div className='text-center flex items-center gap-2 text-gray-500 font-semibold text-xs break-all px-2'>
              <FiPlusCircle className='text-[#ff4d2d] shrink-0' size={16} />
              <span>{itemImage ? `Selected: ${itemImage.name.substring(0, 18)}...` : 'Choose Food Image'}</span>
            </div>
          </div>
        </div>

        <div className='flex items-start gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100 mt-1'>
          <input type="checkbox" id="isAvailable" name="isAvailable" checked={formData.isAvailable} onChange={handleInputChange} className='w-4 h-4 mt-0.5 accent-[#ff4d2d] rounded cursor-pointer shrink-0' />
          <label htmlFor="isAvailable" className='text-xs font-bold text-gray-600 cursor-pointer select-none leading-tight'>Item Available (In-Stock & Ready to Order)</label>
        </div>

        <button type="submit" disabled={formSubmitting} className='w-full bg-[#ff4d2d] disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-[#ff4d2d]/10 hover:bg-[#e6391a] transition-all duration-200 mt-2 flex items-center justify-center gap-2 text-sm'>
          {formSubmitting ? (
            <>
              <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
              <span>Processing Asset Validation...</span>
            </>
          ) : <span>Save Item To Menu</span>}
        </button>
      </form>
    </div>
  );
}