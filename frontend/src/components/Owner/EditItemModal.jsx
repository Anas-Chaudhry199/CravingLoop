import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateMenuItem } from '../../features/user/shopMenu.slice.js'; 
import toast from 'react-hot-toast';

export default function EditItemModal({ item, onClose }) {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    isAvailable: true
  });
  const [itemImage, setItemImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        price: item.price || '',
        category: item.category || '',
        isAvailable: item.isAvailable !== undefined ? item.isAvailable : true
      });
      setItemImage(null); 
    }
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Updating menu item...');

    try {
      setLoading(true);

      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('isAvailable', formData.isAvailable);
      
      if (itemImage) {
        data.append('image', itemImage);
      }

      // Dispatch action and unwrap promise response
      await dispatch(updateMenuItem({ itemId: item._id, formData: data })).unwrap();
      
      toast.success('Item updated successfully! ', { id: toastId });
      onClose(); 
    } catch (err) {
      console.error("RTK Error:", err);
      const errorMessage = typeof err === 'string' ? err : (err?.message || 'An error occurred while updating the item.');
      toast.error(errorMessage, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs'>
      <div className='bg-white w-full max-w-xl rounded-2xl p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto'>
        
        <div className='flex justify-between items-center mb-4'>
          <div>
            <h3 className='text-lg font-extrabold text-gray-800'>Edit Food Item</h3>
            <p className='text-xs font-semibold text-gray-400 mt-0.5'>Modify details for {item.name}</p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className='text-gray-400 hover:text-gray-600 font-bold text-sm bg-gray-100 px-3 py-1.5 rounded-xl transition-all'
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div className='flex flex-col gap-1.5'>
            <label className='text-xs font-bold uppercase tracking-wider text-gray-400'>Food Item Name *</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))} 
              required 
              className='w-full bg-gray-50 border border-gray-100 text-sm font-medium px-4 py-2.5 rounded-xl outline-none focus:bg-white focus:border-[#ff4d2d]/30' 
            />
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='flex flex-col gap-1.5'>
              <label className='text-xs font-bold uppercase tracking-wider text-gray-400'>Category *</label>
              <input 
                type="text" 
                value={formData.category} 
                onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))} 
                required 
                className='w-full bg-gray-50 border border-gray-100 text-sm font-medium px-4 py-2.5 rounded-xl outline-none focus:bg-white focus:border-[#ff4d2d]/30' 
              />
            </div>
            <div className='flex flex-col gap-1.5'>
              <label className='text-xs font-bold uppercase tracking-wider text-gray-400'>Price (Rs.) *</label>
              <input 
                type="number" 
                value={formData.price} 
                onChange={(e) => setFormData(prev => ({...prev, price: e.target.value}))} 
                required 
                className='w-full bg-gray-50 border border-gray-100 text-sm font-medium px-4 py-2.5 rounded-xl outline-none focus:bg-white focus:border-[#ff4d2d]/30' 
              />
            </div>
          </div>

          <div className='flex flex-col gap-1.5'>
            <label className='text-xs font-bold uppercase tracking-wider text-gray-400'>Description</label>
            <textarea 
              value={formData.description} 
              onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))} 
              rows="3" 
              className='w-full bg-gray-50 border border-gray-100 text-sm font-medium px-4 py-2.5 rounded-xl outline-none resize-none focus:bg-white focus:border-[#ff4d2d]/30' 
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <label className='text-xs font-bold uppercase tracking-wider text-gray-400'>New Food Image (Optional)</label>
            <div className='w-full relative flex items-center justify-center border border-gray-200 rounded-xl bg-gray-50 p-3 hover:bg-gray-100/50 cursor-pointer'>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setItemImage(e.target.files[0])} 
                className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10' 
              />
              <div className='text-center text-gray-500 font-semibold text-xs truncate max-w-full px-2'>
                {itemImage ? `Selected: ${itemImage.name}` : 'Upload a new image or leave blank to retain original asset'}
              </div>
            </div>
          </div>

          <div className='flex items-center gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100'>
            <input 
              type="checkbox" 
              id="editIsAvailable" 
              checked={formData.isAvailable} 
              onChange={(e) => setFormData(prev => ({...prev, isAvailable: e.target.checked}))} 
              className='w-4 h-4 accent-[#ff4d2d] cursor-pointer' 
            />
            <label htmlFor="editIsAvailable" className='text-xs font-bold text-gray-600 cursor-pointer select-none'>Item Available (In-Stock)</label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className='w-full bg-[#ff4d2d] text-white font-bold py-3 px-4 rounded-xl shadow-md hover:bg-[#e6391a] transition-all text-sm mt-2 flex justify-center items-center'
          >
            {loading ? 'Updating Item...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}