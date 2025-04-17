import { configureStore } from "@reduxjs/toolkit";
import adminProductsReducer from "./admin/products-slice";
import adminOrdersReducer from "./admin/orders-slice";
import adminUsersReducer from "./admin/users-slice";

export const store = configureStore({
  reducer: {
    adminProducts: adminProductsReducer,
    adminOrders: adminOrdersReducer,
    adminUsers: adminUsersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
}); 