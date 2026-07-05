import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 1. Owner ke liye saare ya kisi specific shop ke orders fetch karne ka thunk (UPDATED)
export const fetchShopOrdersThunk = createAsyncThunk(
    "order/fetchShopOrders",
    async (shopId, thunkAPI) => {
        try {
            // 🟢 Fix: Agar frontend se specific shopId aaye toh query param attach karo
            let url = "/api/v1/shop/order/orders";
            if (shopId) {
                url += `?shopId=${shopId}`;
            }

            const response = await axios.get(url);
            return response.data; // { success: true, data: [orders...] }
        } catch (error) {
            const message = error.response?.data?.message || "Failed to fetch orders";
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// 2. Order status update karne ka thunk
// 2. Order status update karne ka thunk (FIXED URL)
export const updateOrderStatusThunk = createAsyncThunk(
    "order/updateOrderStatus",
    async ({ orderId, status }, thunkAPI) => {
        try {
            // 🟢 Fix: URL ko aapke order.routes.js ke precise pattern ke sath link kiya
            const response = await axios.patch(`/api/v1/shop/order/orders/${orderId}/status`, { status });
            return response.data; // { success: true, data: updatedOrderObj }
        } catch (error) {
            const message = error.response?.data?.message || "Failed to update order status";
            return thunkAPI.rejectWithValue(message);
        }
    }
);

const orderSlice = createSlice({
    name: "order",
    initialState: {
        orders: [],      // Owner dashboard ke liye orders array
        loading: false,
        error: null
    },
    reducers: {
        clearOrderState: (state) => {
            state.orders = [];
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // ==========================================
            // FETCH SHOP ORDERS
            // ==========================================
            .addCase(fetchShopOrdersThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchShopOrdersThunk.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload?.success) {
                    state.orders = action.payload.data;
                }
            })
            .addCase(fetchShopOrdersThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ==========================================
            // UPDATE ORDER STATUS
            // ==========================================
            .addCase(updateOrderStatusThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload?.success && action.payload?.data) {
                    const updatedOrder = action.payload.data;
                    state.orders = state.orders.map((order) => 
                        order._id === updatedOrder._id ? updatedOrder : order
                    );
                }
            })
            .addCase(updateOrderStatusThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearOrderState } = orderSlice.actions;
export default orderSlice.reducer;