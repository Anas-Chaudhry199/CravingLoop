// store/slices/cartSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    cartItems: [],
    totalAmount: 0,
    totalQuantity: 0,
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const newItem = action.payload;
            // Check karo kya item pehle se cart mein hai?
            const existingItem = state.cartItems.find(item => item._id === newItem._id);
            
            state.totalQuantity++;
            
            if (!existingItem) {
                state.cartItems.push({
                    _id: newItem._id,
                    name: newItem.name,
                    image: newItem.image,
                    price: newItem.price,
                    quantity: 1,
                    totalPrice: newItem.price
                });
            } else {
                existingItem.quantity++;
                existingItem.totalPrice = Number(existingItem.totalPrice) + Number(newItem.price);
            }

            // Global Subtotal Auto-Calculate
            state.totalAmount = state.cartItems.reduce((total, item) => total + Number(item.price) * item.quantity, 0);
        },

        removeFromCart: (state, action) => {
            const id = action.payload;
            const existingItem = state.cartItems.find(item => item._id === id);

            if (existingItem) {
                state.totalQuantity -= existingItem.quantity;
                state.cartItems = state.cartItems.filter(item => item._id !== id);
            }
            
            state.totalAmount = state.cartItems.reduce((total, item) => total + Number(item.price) * item.quantity, 0);
        },

        decreaseQuantity: (state, action) => {
            const id = action.payload;
            const existingItem = state.cartItems.find(item => item._id === id);

            if (existingItem) {
                state.totalQuantity--;
                if (existingItem.quantity === 1) {
                    state.cartItems = state.cartItems.filter(item => item._id !== id);
                } else {
                    existingItem.quantity--;
                    existingItem.totalPrice = Number(existingItem.totalPrice) - Number(existingItem.price);
                }
            }

            state.totalAmount = state.cartItems.reduce((total, item) => total + Number(item.price) * item.quantity, 0);
        },

        clearCart: (state) => {
            state.cartItems = [];
            state.totalAmount = 0;
            state.totalQuantity = 0;
        }
    }
});

export const { addToCart, removeFromCart, decreaseQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;