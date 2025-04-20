import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const initialState = {
  cartItems: null,
  isLoading: false,
  error: null,
};

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ userId, productId, quantity }, { rejectWithValue }) => {
    if (!userId) {
      return rejectWithValue({ message: "Valid user ID is required" });
    }
    try {
      const response = await axios.post(
        `${API_URL}/api/shop/cart/add`,
        { userId, productId, quantity },
        { withCredentials: true }
      );
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to add to cart");
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message || "Failed to add to cart" }
      );
    }
  }
);

export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async (userId, { rejectWithValue }) => {
    if (!userId) {
      return rejectWithValue({ message: "Valid user ID is required" });
    }
    try {
      const response = await axios.get(`${API_URL}/api/shop/cart/get/${userId}`, {
        withCredentials: true,
      });
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch cart items");
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message || "Failed to fetch cart items" }
      );
    }
  }
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async ({ userId, productId }, { rejectWithValue }) => {
    if (!userId || !productId) {
      return rejectWithValue({ message: "User ID and Product ID are required" });
    }
    try {
      const response = await axios.delete(
        `${API_URL}/api/shop/cart/${userId}/${productId}`,
        { withCredentials: true }
      );
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete cart item");
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message || "Failed to delete cart item" }
      );
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
  "cart/updateCartQuantity",
  async ({ userId, productId, quantity }, { rejectWithValue }) => {
    if (!userId || !productId || quantity < 1) {
      return rejectWithValue({ message: "Valid user ID, product ID, and quantity are required" });
    }
    try {
      const response = await axios.put(
        `${API_URL}/api/shop/cart/update-cart`,
        { userId, productId, quantity },
        { withCredentials: true }
      );
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update cart quantity");
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message || "Failed to update cart quantity" }
      );
    }
  }
);

const shoppingCartSlice = createSlice({
  name: "shoppingCart",
  initialState,
  reducers: {
    clearCart: (state) => {
      state.cartItems = null;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message;
      })
      .addCase(fetchCartItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message;
        state.cartItems = null;
      })
      .addCase(updateCartQuantity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message;
      })
      .addCase(deleteCartItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
      })
      .addCase(deleteCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message;
      });
  },
});

export const { clearCart } = shoppingCartSlice.actions;
export default shoppingCartSlice.reducer;
