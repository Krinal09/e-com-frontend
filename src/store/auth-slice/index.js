import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null, 
};

export const registerUser = createAsyncThunk(
  "/auth/register",
  async (formData) => {
    const response = await axios.post(
      `${BASE_URL}/api/auth/register`,
      formData,
      {
        withCredentials: true,
      }
    );
    return response.data;
  }
);

export const loginUser = createAsyncThunk(
  "/auth/login",
  async (formData) => {
    const response = await axios.post(
      `${BASE_URL}/api/auth/login`,
      formData,
      {
        withCredentials: true,
      }
    );
    return response.data;
  }
);

export const logoutUser = createAsyncThunk(
  "/auth/logout",
  async () => {
    const response = await axios.post(
      `${BASE_URL}/api/auth/logout`,
      {},
      {
        withCredentials: true,
      }
    );
    return response.data;
  }
);

export const checkAuth = createAsyncThunk(
  "/auth/checkauth",
  async () => {
    const response = await axios.get(
      `${BASE_URL}/api/auth/check-auth`,
      {
        withCredentials: true,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
    return response.data;
  }
);

export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async ({ userName, profileImage }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/auth/profile`,
        { userName, profileImage },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Profile update failed" });
    }
  }
);

export const deleteUserAccount = createAsyncThunk(
  "auth/deleteUserAccount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/api/auth/profile`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Account deletion failed" });
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ oldPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/auth/change-password`,
        { oldPassword, newPassword },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Password change failed" });
    }
  }
);

export const updateProfilePicture = createAsyncThunk(
  "auth/updateProfilePicture",
  async (profileImage, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/auth/profile`,
        { profileImage },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Profile picture update failed" });
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.user = {
            ...action.payload.user,
            profileImage: action.payload.user.profileImage || localStorage.getItem('profileImage') || ""
          };
          if (action.payload.user.profileImage) {
            localStorage.setItem('profileImage', action.payload.user.profileImage);
          }
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      })
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success && action.payload.user) {
          const storedProfileImage = localStorage.getItem('profileImage');
          
          state.user = {
            id: action.payload.user.id,
            userName: action.payload.user.userName,
            email: action.payload.user.email,
            role: action.payload.user.role,
            profileImage: action.payload.user.profileImage || storedProfileImage || ""
          };
          
          if (action.payload.user.profileImage) {
            localStorage.setItem('profileImage', action.payload.user.profileImage);
          }
          
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.user = {
            ...state.user,
            ...action.payload.user
          };
        }
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to update profile";
      })
      .addCase(deleteUserAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteUserAccount.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(deleteUserAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      })
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.user = { ...state.user, ...action.payload.user };
        }
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      })
      .addCase(updateProfilePicture.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          const currentUser = state.user;
          const newProfileImage = action.payload.user.profileImage;
          
          state.user = {
            ...currentUser,
            profileImage: newProfileImage || currentUser?.profileImage || ""
          };
          
          if (newProfileImage) {
            localStorage.setItem('profileImage', newProfileImage);
          }
        }
        state.error = null;
      })
      .addCase(updateProfilePicture.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to update profile picture";
      });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
