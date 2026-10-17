import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api.js";

// Async thunk to verify session on initial load
export const verifySession = createAsyncThunk(
  "auth/verifySession",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("proctor_token");
    if (!token) {
      return rejectWithValue("No token found");
    }
    try {
      const res = await api.get("/auth/me");
      const user = res.data?.data?.user;
      if (user) {
        localStorage.setItem("proctor_user", JSON.stringify(user));
        return { user, token };
      }
      return rejectWithValue("Invalid user payload");
    } catch (err) {
      localStorage.removeItem("proctor_user");
      localStorage.removeItem("proctor_token");
      return rejectWithValue(err.response?.data?.message || "Session expired");
    }
  }
);

// Async thunk to login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { user, token } = res.data.data;
      localStorage.setItem("proctor_user", JSON.stringify(user));
      localStorage.setItem("proctor_token", token);
      return { user, token };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

// Async thunk to register
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/register", userData);
      const { user, token } = res.data.data;
      localStorage.setItem("proctor_user", JSON.stringify(user));
      localStorage.setItem("proctor_token", token);
      return { user, token };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Registration failed");
    }
  }
);

// Async thunk to logout
export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  try {
    await api.post("/auth/logout");
  } catch (err) {
    // Ignore network error on logout
  }
  localStorage.removeItem("proctor_user");
  localStorage.removeItem("proctor_token");
  return null;
});

const initialState = {
  user: (() => {
    try {
      const saved = localStorage.getItem("proctor_user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  })(),
  token: localStorage.getItem("proctor_token") || null,
  loading: true,
  error: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.loading = false;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem("proctor_user");
      localStorage.removeItem("proctor_token");
    },
  },
  extraReducers: (builder) => {
    // verifySession
    builder
      .addCase(verifySession.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifySession.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.loading = false;
        state.error = null;
      })
      .addCase(verifySession.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.loading = false;
      });

    // loginUser
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.loading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // registerUser
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // logoutUser
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;
    });
  },
});

export const { setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
