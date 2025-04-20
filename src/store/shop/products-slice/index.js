import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const initialState = {
  isLoading: false,
  productList: [],
  productDetails: null,
  pagination: {
    total: 0,
    page: 1,
    pages: 1,
  },
  error: null,
};

// For filtered products (customer view)
export const fetchAllFilteredProducts = createAsyncThunk(
  "/products/fetchAllFilteredProducts",
  async ({ filterParams, sortParams, page = 1, limit = 12 }, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams({
        ...filterParams,
        sortBy: sortParams,
        page,
        limit,
      });

      const response = await axios.get(`${API_URL}/api/shop/products/get?${query}`);
      
      return response.data;
    } catch (error) {
      console.error("Fetch filtered products error:", error.response?.data || error);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// For a single product's details
export const fetchProductDetails = createAsyncThunk(
  "/products/fetchProductDetails",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/shop/products/get/${id}`);
      
      return response.data;
    } catch (error) {
      console.error("Fetch product details error:", error.response?.data || error);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// For admin to get all products
export const fetchAllProducts = createAsyncThunk(
  "/products/fetchAllAdminProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/products`);
      
      return response.data;
    } catch (error) {
      console.error("Fetch all products for admin error:", error.response?.data || error);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const shoppingProductSlice = createSlice({
  name: "shoppingProducts",
  initialState,
  reducers: {
    setProductDetails: (state) => {
      state.productDetails = null;
    },
    setCurrentPage: (state, action) => {
      state.pagination.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFilteredProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllFilteredProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchAllFilteredProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.productList = [];
        state.pagination = initialState.pagination;
        state.error = action.payload?.message || "Failed to fetch filtered products";
      })
      .addCase(fetchProductDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productDetails = action.payload.data;
        state.error = null;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.productDetails = null;
        state.error = action.payload?.message || "Failed to fetch product details";
      })
      .addCase(fetchAllProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = action.payload.data;
        state.error = null;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.productList = [];
        state.error = action.payload?.message || "Failed to fetch all products";
      });
  },
});

export const { setProductDetails, setCurrentPage } = shoppingProductSlice.actions;

export default shoppingProductSlice.reducer;
