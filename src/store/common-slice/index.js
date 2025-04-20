import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  categoryList: [],
  loading: false,
  error: null,
  featureImageList: [],
};

export const getCategories = createAsyncThunk(
  "/order/getCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/common/categories");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addCategory = createAsyncThunk(
  "/order/addCategory",
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/common/categories/add", categoryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getFeatureImages = createAsyncThunk(
  "/common/getFeatureImages",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/common/feature/get");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const commonSlice = createSlice({
  name: "commonFeature",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categoryList = action.payload.data;
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch categories";
        state.categoryList = [];
      })
      .addCase(addCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCategory.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to add category";
      })
      .addCase(getFeatureImages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFeatureImages.fulfilled, (state, action) => {
        state.loading = false;
        state.featureImageList = action.payload.data;
      })
      .addCase(getFeatureImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch feature images";
        state.featureImageList = [];
      });
  },
});

export default commonSlice.reducer;
