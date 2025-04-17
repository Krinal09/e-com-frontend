import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchAllOrders = createAsyncThunk(
  "orders/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/orders`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch orders");
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "orders/updateStatus",
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/orders/${orderId}`,
        { status },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update order status");
    }
  }
);

export const createCODOrder = createAsyncThunk(
  "orders/createCOD",
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/orders/cod",
        orderData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create COD order");
    }
  }
);

const initialState = {
  orderList: [],
  isLoading: false,
  error: null,
  codOrderCount: 0,
};

const adminOrdersSlice = createSlice({
  name: "adminOrders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        const orders = Array.isArray(action.payload.data) 
          ? action.payload.data 
          : action.payload.data?.orders || [];
        state.orderList = orders.map(order => ({
          ...order,
          paymentMethod: order.paymentMethod || 'online',
          customerEmail: order.customerEmail || order.user?.email || 'N/A',
          status: order.status || 'pending'
        }));
        state.error = null;

        // Count COD orders that are completed without UPI
        state.codOrderCount = orders.filter(order => 
          order.paymentMethod === 'cod' && 
          order.status === 'completed' && 
          !order.paymentId
        ).length;

        console.log("Updated orders state:", state.orderList);
        console.log("COD order count:", state.codOrderCount);
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        console.error("Orders fetch error:", action.payload);
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedOrder = action.payload.data;
        state.orderList = state.orderList.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        );
        // Update COD count if needed
        if (updatedOrder.paymentMethod === 'cod' && updatedOrder.status === 'completed' && !updatedOrder.paymentId) {
          state.codOrderCount += 1;
        }
        state.error = null;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createCODOrder.fulfilled, (state, action) => {
        state.orderList.push(action.payload.order);
        // Increment COD count if the order is completed
        if (action.payload.order.status === 'completed' && !action.payload.order.paymentId) {
          state.codOrderCount += 1;
        }
      });
  },
});

export default adminOrdersSlice.reducer; 