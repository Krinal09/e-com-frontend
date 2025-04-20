import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const initialState = {
  orderList: [],
  orderDetails: null,
  isLoading: false,
  error: null
};

export const getAllOrdersForAdmin = createAsyncThunk(
  "/order/getAllOrdersForAdmin",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Fetching orders...");

      const response = await axios.get(
        `${API_URL}/api/admin/orders/get`,
        { withCredentials: true }
      );

      console.log("Orders response:", response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch orders");
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching orders:", error);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const getOrderDetailsForAdmin = createAsyncThunk(
  "/order/getOrderDetailsForAdmin",
  async (id, { rejectWithValue }) => {
    try {
      console.log("Fetching order details for ID:", id);

      const response = await axios.get(
        `${API_URL}/api/admin/orders/details/${id}`,
        { withCredentials: true }
      );

      console.log("Order details response:", response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch order details");
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching order details:", error);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "/order/updateOrderStatus",
  async ({ id, orderStatus, paymentStatus }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/admin/orders/update/${id}`,
        { orderStatus, paymentStatus },
        { withCredentials: true }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update order status");
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updatePaymentStatus = createAsyncThunk(
  "/order/updatePaymentStatus",
  async ({ id, paymentStatus }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/admin/orders/payment-status/${id}`,
        { paymentStatus },
        { withCredentials: true }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update payment status");
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const adminOrderSlice = createSlice({
  name: "adminOrderSlice",
  initialState,
  reducers: {
    resetOrderDetails: (state) => {
      state.orderDetails = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllOrdersForAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllOrdersForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderList = action.payload.data.map(order => {
          const customerName = order.user?.userName ||
                               order.userId?.userName ||
                               order.addressInfo?.name ||
                               'N/A';

          return {
            ...order,
            customerName,
            orderStatus: order.orderStatus || 'pending',
            paymentStatus: order.paymentStatus || 'pending',
            paymentMethod: order.paymentMethod || 'ONLINE'
          };
        });
        state.error = null;
      })
      .addCase(getAllOrdersForAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.orderList = [];
        state.error = action.payload?.message || "Failed to fetch orders";
      })
      .addCase(getOrderDetailsForAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrderDetailsForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        const orderData = action.payload.data;
        state.orderDetails = {
          ...orderData,
          customerName: orderData.user?.userName ||
                        orderData.userId?.userName ||
                        orderData.addressInfo?.name ||
                        'N/A',
          orderStatus: orderData.orderStatus || 'pending',
          paymentStatus: orderData.paymentStatus || 'pending',
          paymentMethod: orderData.paymentMethod || 'ONLINE'
        };
        state.error = null;
      })
      .addCase(getOrderDetailsForAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.orderDetails = null;
        state.error = action.payload?.message || "Failed to fetch order details";
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to update order status";
      })
      .addCase(updatePaymentStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePaymentStatus.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to update payment status";
      });
  },
});

export const { resetOrderDetails } = adminOrderSlice.actions;
export default adminOrderSlice.reducer;
