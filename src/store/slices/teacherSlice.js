import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api.js";

// Fetch teacher dashboard data (supports silent refresh to avoid page flicker)
export const fetchTeacherDashboard = createAsyncThunk(
  "teacher/fetchDashboard",
  async (options = {}, { rejectWithValue }) => {
    try {
      const res = await api.get("/teacher/dashboard");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load dashboard data");
    }
  }
);

const initialState = {
  stats: null,
  eventDistribution: [],
  liveSessions: [],
  recentEvents: [],
  loading: false,
  error: null,
};

export const teacherSlice = createSlice({
  name: "teacher",
  initialState,
  reducers: {
    // Smoothly update recent events on socket
    addRecentEvent: (state, action) => {
      const newEvent = action.payload;
      if (newEvent?._id) {
        state.recentEvents = [newEvent, ...state.recentEvents.filter((e) => e._id !== newEvent._id)].slice(0, 10);
      }
    },
    updateLiveSessionRisk: (state, action) => {
      const { attemptId, newRiskScore } = action.payload;
      const session = state.liveSessions.find((s) => s._id === attemptId);
      if (session) {
        session.riskScore = newRiskScore;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeacherDashboard.pending, (state, action) => {
        // Only set loading if NOT a silent background update
        if (!action.meta.arg?.silent && !state.stats) {
          state.loading = true;
        }
      })
      .addCase(fetchTeacherDashboard.fulfilled, (state, action) => {
        state.stats = action.payload.stats;
        state.eventDistribution = action.payload.eventDistribution || [];
        state.liveSessions = action.payload.liveSessions || [];
        state.recentEvents = action.payload.recentEvents || [];
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchTeacherDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addRecentEvent, updateLiveSessionRisk } = teacherSlice.actions;
export default teacherSlice.reducer;
