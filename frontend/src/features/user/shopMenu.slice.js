import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchShopDashboardData = createAsyncThunk(
    "shopMenu/fetchDashboardData",
    async (shopId, thunkAPI) => {
        try {
            const url = shopId 
                ? `/api/v1/shop/get-shop-details?shopId=${shopId}` 
                : "/api/v1/shop/get-shop-details";

            const shopResponse = await axios.get(url);

            if (shopResponse.data.success && !shopResponse.data.data) {
                return { shopInfo: null, menuItems: [] };
            }

            if (shopResponse.data.success && shopResponse.data.data) {
                const shopData = shopResponse.data.data;
                const menuResponse = await axios.get(`/api/v1/item/get-shop-items/${shopData._id}`);

                return {
                    shopInfo: shopData,
                    menuItems: menuResponse.data.success ? menuResponse.data.data : []
                };
            }

            return { shopInfo: null, menuItems: [] };
        } catch (error) {
            const message = error.response?.data?.message || "Dashboard data loading failed!";
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const addItemToMenu = createAsyncThunk(
    "shopMenu/addItem",
    async ({ shopId, formData }, thunkAPI) => {
        try {
            const response = await axios.post(`/api/v1/item/add-item/${shopId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || "Something went wrong while adding an Item";
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const updateMenuItem = createAsyncThunk(
    "shopMenu/updateMenuItem",
    async ({ itemId, formData }, thunkAPI) => {
        try {
            const response = await axios.post(`/api/v1/item/edit-item/${itemId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || "Something went wrong while updating the item";
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const deleteMenuItem = createAsyncThunk(
    "shopMenu/deleteMenuItem",
    async (itemId, thunkAPI) => {
        try {
            const response = await axios.delete(`/api/v1/item/delete-item/${itemId}`);
            return { responseData: response.data, itemId };
        } catch (error) {
            const message = error.response?.data?.message || "Failed to delete the item";
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const updateShopDetailsThunk = createAsyncThunk(
    "shopMenu/updateDetails",
    async (formData, thunkAPI) => {
        try {
            const response = await axios.patch("/api/v1/shop/update-Shop-details", formData);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || "Failed to update shop details";
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const updateShopBannerThunk = createAsyncThunk(
    "shopMenu/updateBanner",
    async (formData, thunkAPI) => {
        try {
            const response = await axios.patch("/api/v1/shop/update-shop-banner", formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || "Failed to update shop banner";
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const deleteShopThunk = createAsyncThunk(
    "shopMenu/deleteShop",
    async (shopId, thunkAPI) => {
        try {
            const url = shopId ? `/api/v1/shop/delete-shop?shopId=${shopId}` : "/api/v1/shop/delete-shop";
            const response = await axios.delete(url);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || "Failed to delete shop permanently.";
            return thunkAPI.rejectWithValue(message);
        }
    }
);

const initialState = {
    shopInfo: null,
    menuItems: [],
    loading: false,
    error: null,
};

const shopMenuSlice = createSlice({
    name: "shopMenu",
    initialState,
    reducers: {
        clearShopErrors: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // --- Fetch Dashboard Cases ---
            .addCase(fetchShopDashboardData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchShopDashboardData.fulfilled, (state, action) => {
                state.loading = false;
                state.shopInfo = action.payload?.shopInfo || null;
                state.menuItems = action.payload?.menuItems || [];
                state.error = null;
            })
            .addCase(fetchShopDashboardData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // --- Add Item Cases ---
            .addCase(addItemToMenu.fulfilled, (state, action) => {
                if (action.payload?.success && action.payload?.data) {
                    state.menuItems.push(action.payload.data);
                }
            })

            // --- Update Item Cases ---
            .addCase(updateMenuItem.fulfilled, (state, action) => {
                if (action.payload?.success && action.payload?.data) {
                    const updatedItem = action.payload.data;
                    state.menuItems = state.menuItems.map((item) =>
                        item._id === updatedItem._id ? updatedItem : item
                    );
                }
            })

            // --- Delete Item Cases ---
            .addCase(deleteMenuItem.fulfilled, (state, action) => {
                const deletedItemId = action.payload?.responseData?.data?.itemId || action.payload?.itemId;
                if (deletedItemId) {
                    state.menuItems = state.menuItems.filter(item => item._id !== deletedItemId);
                }
                state.loading = false;
            })
            .addCase(deleteMenuItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // --- Update Shop Details Cases (🔴 FIXED: loading state separated) ---
            .addCase(updateShopDetailsThunk.pending, (state) => {
                state.error = null;
            })
            .addCase(updateShopDetailsThunk.fulfilled, (state, action) => {
                if (action.payload?.success && action.payload?.data) {
                    state.shopInfo = action.payload.data;
                }
            })
            .addCase(updateShopDetailsThunk.rejected, (state, action) => {
                state.error = action.payload;
            })

            // --- Update Shop Banner Cases ---
            .addCase(updateShopBannerThunk.pending, (state) => {
                state.error = null;
            })
            .addCase(updateShopBannerThunk.fulfilled, (state, action) => {
                if (action.payload?.success && action.payload?.data) {
                    state.shopInfo = action.payload.data;
                }
            })
            .addCase(updateShopBannerThunk.rejected, (state, action) => {
                state.error = action.payload;
            })

            // --- Delete Shop Entirely Cases ---
            .addCase(deleteShopThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteShopThunk.fulfilled, (state) => {
                state.loading = false;
                state.shopInfo = null; 
                state.menuItems = [];
                state.error = null;
            })
            .addCase(deleteShopThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearShopErrors } = shopMenuSlice.actions;
export default shopMenuSlice.reducer;