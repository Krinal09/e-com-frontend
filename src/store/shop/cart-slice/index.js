import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  cartItems: null,
  isLoading: false,
  error: null,
};

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ userId, productId, quantity }, { rejectWithValue }) => {
    console.log("addToCart - Sending:", { userId, productId, quantity });
    if (!userId || userId === null || userId === undefined) {
      console.error("addToCart - Invalid userId:", userId);
      return rejectWithValue({ message: "Valid user ID is required" });
    }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/shop/cart/add`,
        {
          userId,
          productId,
          quantity,
        },
        {
          withCredentials: true,
        }
      );

      if (!response.data.success) {
        console.error("addToCart - Failed:", response.data);
        throw new Error(response.data.message || "Failed to add to cart");
      }

      console.log("addToCart - Success, Cart:", response.data.data);
      return response.data;
    } catch (error) {
      console.error("addToCart - Error:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data || { message: error.message || "Failed to add to cart" }
      );
    }
  }
);

export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async (userId, { rejectWithValue }) => {
    console.log("fetchCartItems - UserId:", userId);
    if (!userId || userId === null || userId === undefined) {
      console.error("fetchCartItems - Invalid userId:", userId);
      return rejectWithValue({ message: "Valid user ID is required" });
    }
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/shop/cart/get/${userId}`,
        {
          withCredentials: true,
        }
      );

      if (!response.data.success) {
        console.error("fetchCartItems - Failed:", response.data);
        throw new Error(response.data.message || "Failed to fetch cart items");
      }

      console.log("fetchCartItems - Success, Cart:", response.data.data);
      return response.data;
    } catch (error) {
      console.error("fetchCartItems - Error:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data || { message: error.message || "Failed to fetch cart items" }
      );
    }
  }
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async ({ userId, productId }, { rejectWithValue }) => {
    console.log("deleteCartItem - UserId:", userId, "ProductId:", productId);
    if (!userId || userId === null || userId === undefined) {
      console.error("deleteCartItem - Invalid userId:", userId);
      return rejectWithValue({ message: "Valid user ID is required" });
    }
    if (!productId) {
      console.error("deleteCartItem - Invalid productId:", productId);
      return rejectWithValue({ message: "Valid product ID is required" });
    }
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/shop/cart/${userId}/${productId}`,
        {
          withCredentials: true,
        }
      );

      if (!response.data.success) {
        console.error("deleteCartItem - Failed:", response.data);
        throw new Error(response.data.message || "Failed to delete cart item");
      }

      console.log("deleteCartItem - Success, Cart:", response.data.data);
      return response.data;
    } catch (error) {
      console.error("deleteCartItem - Error:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data || { message: error.message || "Failed to delete cart item" }
      );
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
  "cart/updateCartQuantity",
  async ({ userId, productId, quantity }, { rejectWithValue }) => {
    console.log("updateCartQuantity - UserId:", userId, "ProductId:", productId, "Quantity:", quantity);
    if (!userId || userId === null || userId === undefined) {
      console.error("updateCartQuantity - Invalid userId:", userId);
      return rejectWithValue({ message: "Valid user ID is required" });
    }
    if (!productId || quantity === undefined || quantity < 1) {
      console.error("updateCartQuantity - Invalid data:", { productId, quantity });
      return rejectWithValue({ message: "Valid product ID and quantity are required" });
    }
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/shop/cart/update-cart`,
        {
          userId,
          productId,
          quantity,
        },
        {
          withCredentials: true,
        }
      );

      if (!response.data.success) {
        console.error("updateCartQuantity - Failed:", response.data);
        throw new Error(response.data.message || "Failed to update cart quantity");
      }

      console.log("updateCartQuantity - Success, Cart:", response.data.data);
      return response.data;
    } catch (error) {
      console.error("updateCartQuantity - Error:", error.response?.data || error.message);
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
      console.log("clearCart - Resetting cart state");
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
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to add to cart";
      })
      .addCase(fetchCartItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
        state.error = null;
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to fetch cart items";
      })
      .addCase(updateCartQuantity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
        state.error = null;
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to update cart quantity";
      })
      .addCase(deleteCartItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
        state.error = null;
      })
      .addCase(deleteCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to delete cart item";
      });
  },
});

export const { clearCart } = shoppingCartSlice.actions;
export default shoppingCartSlice.reducer;
