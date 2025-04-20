import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const initialState = {
  isLoading: false,
  reviews: [],
  error: null,
};

export const addReview = createAsyncThunk(
  "/review/addReview",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/shop/reviews/add`,
        formData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to add review" });
    }
  }
);

export const getReviews = createAsyncThunk(
  "/review/getReviews",
  async (productId, { rejectWithValue }) => {
    try {
      if (!productId) {
        throw new Error("Product ID is required");
      }

      const response = await axios.get(
        `${API_URL}/api/shop/reviews/${productId}`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch reviews");
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message || "Failed to fetch reviews" });
    }
  }
);

const reviewSlice = createSlice({
  name: "reviewSlice",
  initialState,
  reducers: {
    clearReviews: (state) => {
      state.reviews = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add Review
      .addCase(addReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (action.payload.data) {
          state.reviews = [action.payload.data, ...state.reviews];
        }
      })
      .addCase(addReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to add review";
      })
      // Get Reviews
      .addCase(getReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload.data || [];
        state.error = null;
      })
      .addCase(getReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.reviews = [];
        state.error = action.payload?.message || "Failed to fetch reviews";
      });
  },
});

export const { clearReviews } = reviewSlice.actions;
export default reviewSlice.reducer;
