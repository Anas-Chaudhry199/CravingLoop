import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchCurrentUser = createAsyncThunk(
    "user/fetchCurrentUser",
    async (_, thunkAPI) => {
        try {
            const response = await axios.get("/api/v1/user/current-user");
            return response.data?.data; 
        } catch (error) {
            const message = error.response?.data?.message || "Session expired";
            return thunkAPI.rejectWithValue(message); 
        }
    }
);

const initialState = {
    user: null,
    city: "Lahore", // 🟢 Fallback city state standard camelCase mein
    loading: true, 
    error: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            state.loading = false;
        },
        setCity: (state, action) => {
            state.city = action.payload; // 🟢 Fixed Typo (Capital C to small c)
        },
        clearUser: (state) => {
            state.user = null;
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCurrentUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.loading = false;
                state.user = null;
                state.error = action.payload;
            });
    }
});

export const { setUser, clearUser, setCity } = userSlice.actions;
export default userSlice.reducer;