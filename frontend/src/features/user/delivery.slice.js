import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 🌐 Sync parameters with app.js route injection strategy
const API_URL = "/api/v1/shop/order"; 

// 1. AsyncThunk: Active deliveries ko pool se fetch karne ke liye
export const fetchActiveDeliveries = createAsyncThunk(
    "delivery/fetchActive",
    async (_, { rejectWithValue }) => {
        try {
            // Target: GET /api/v1/shop/order/delivery/active
            const response = await axios.get(`${API_URL}/delivery/active`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to load active shipments."
            );
        }
    }
);

// 2. AsyncThunk: Order status ko Delivered mark karne ke liye
export const completeShipmentDelivery = createAsyncThunk(
    "delivery/completeShipment",
    async (orderId, { rejectWithValue }) => {
        try {
            // Target: PATCH /api/v1/shop/order/delivery/complete/:orderId
            const response = await axios.patch(`${API_URL}/delivery/complete/${orderId}`);
            return response.data.data; 
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to mark order as delivered."
            );
        }
    }
);

const deliverySlice = createSlice({
    name: "delivery",
    initialState: {
        deliveries: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearDeliveryErrors: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // --- Fetch Active Active State Pipeline ---
            .addCase(fetchActiveDeliveries.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchActiveDeliveries.fulfilled, (state, action) => {
                state.loading = false;
                state.deliveries = action.payload;
            })
            .addCase(fetchActiveDeliveries.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // --- Complete Shipment Processing State Pipeline ---
            .addCase(completeShipmentDelivery.pending, (state) => {
                state.loading = true;
            })
            .addCase(completeShipmentDelivery.fulfilled, (state, action) => {
                state.loading = false;
                // Delivered hote hi use active tasks se auto-filter out kar do
                state.deliveries = state.deliveries.filter(
                    (order) => order._id !== action.payload._id
                );
            })
            .addCase(completeShipmentDelivery.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearDeliveryErrors } = deliverySlice.actions;
export default deliverySlice.reducer;