import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "./services/auth.services";

const loadUserFromStorage = () => {
  try {
    const stored = localStorage.getItem("auth_user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const handleRegister = createAsyncThunk(
  "auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      const data = await authService.register(formData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Registration failed");
    }
  },
);

export const handleLogin = createAsyncThunk(
  "auth/login",
  async (formData, { rejectWithValue }) => {
    try {
      const data = await authService.login(formData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Login failed");
    }
  },
);

export const handleLogout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return null;
    } catch (error) {
      return rejectWithValue(error.message || "Logout failed");
    }
  },
);

export const getUser = createAsyncThunk(
  "auth/getUser",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const data = await authService.getUser();
      if (data === null) {
        dispatch(authSlice.actions.logout());
        return rejectWithValue("Not authenticated");
      }
      return data;
    } catch (error) {
      if (error.response?.status === 401) {
        dispatch(authSlice.actions.logout());
      }
      return rejectWithValue(error.message || "Failed to get user");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: loadUserFromStorage(),
    loading: false,
    initialized: false,
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      if (action.payload) {
        localStorage.setItem("auth_user", JSON.stringify(action.payload));
      } else {
        localStorage.removeItem("auth_user");
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.error = null;
      state.initialized = true;
      localStorage.removeItem("auth_user");
    },
    setInitialized: (state) => {
      state.initialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(handleRegister.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(handleRegister.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(handleRegister.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(handleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(handleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        localStorage.setItem("auth_user", JSON.stringify(action.payload.user));
      })
      .addCase(handleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        if (action.payload?.user) {
          state.user = action.payload.user;
          localStorage.setItem("auth_user", JSON.stringify(action.payload.user));
        } else {
          state.user = null;
          localStorage.removeItem("auth_user");
        }
      })
      .addCase(getUser.rejected, (state) => {
        state.loading = false;
        state.initialized = true;
        state.user = null;
        localStorage.removeItem("auth_user");
      })
      .addCase(handleLogout.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
        state.initialized = true;
        localStorage.removeItem("auth_user");
      });
  },
});

export const { setUser, setLoading, setError, clearError, logout, setInitialized } =
  authSlice.actions;
export default authSlice.reducer;