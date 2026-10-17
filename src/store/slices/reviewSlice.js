import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api.js";

// Fetch review queue events (loading only triggers here)
export const fetchReviews = createAsyncThunk(
  "reviews/fetchReviews",
  async (statusFilter, { rejectWithValue }) => {
    try {
      const res = await api.get(`/teacher/reviews?status=${statusFilter || "all"}`);
      return res.data.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load reviews");
    }
  }
);

// Submit review decision (False Alarm or Valid Incident)
export const submitReview = createAsyncThunk(
  "reviews/submitReview",
  async ({ eventId, decision, notes = "" }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/events/${eventId}/reviews`, { decision, notes });
      return { eventId, decision, notes, data: res.data.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Review action failed");
    }
  }
);

const initialState = {
  events: [],
  loading: false,
  filter: "all",
  selectedEvent: null,
  liveAlerts: [],
  error: null,
};

export const reviewSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    setSelectedEvent: (state, action) => {
      state.selectedEvent = action.payload;
    },
    // Real-time socket event flagged: PREPEND smoothly without page reload or spinner!
    eventFlagged: (state, action) => {
      const newEvent = action.payload;
      if (!newEvent || !newEvent._id) return;

      // Check if event belongs to current filter
      const matchesFilter =
        state.filter === "all" ||
        (state.filter === "pending" && !newEvent.isReviewed) ||
        (state.filter === "valid" && newEvent.reviewDecision === "valid") ||
        (state.filter === "false_alarm" && newEvent.reviewDecision === "false_alarm");

      if (matchesFilter) {
        // Remove duplicate if already present, then prepend to top smoothly
        const filtered = state.events.filter((e) => e._id !== newEvent._id);
        state.events = [newEvent, ...filtered];
      }
    },
    // Real-time socket event reviewed: UPDATE IN-PLACE smoothly without page reload or spinner!
    eventReviewed: (state, action) => {
      const { eventId, decision } = action.payload;
      const target = state.events.find((e) => e._id === eventId);
      if (target) {
        target.isReviewed = true;
        target.reviewDecision = decision;
      }
      if (state.selectedEvent?._id === eventId) {
        state.selectedEvent.isReviewed = true;
        state.selectedEvent.reviewDecision = decision;
      }
      // Remove from liveAlerts if active
      state.liveAlerts = state.liveAlerts.filter((a) => a.id !== eventId);
    },
    // Live alert toasts
    addLiveAlert: (state, action) => {
      state.liveAlerts = [action.payload, ...state.liveAlerts.slice(0, 4)];
    },
    removeLiveAlert: (state, action) => {
      state.liveAlerts = state.liveAlerts.filter((a) => a.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.events = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Optimistic in-place update on review submit without reloading page
      .addCase(submitReview.fulfilled, (state, action) => {
        const { eventId, decision } = action.payload;
        const target = state.events.find((e) => e._id === eventId);
        if (target) {
          target.isReviewed = true;
          target.reviewDecision = decision;
        }
        if (state.selectedEvent?._id === eventId) {
          state.selectedEvent.isReviewed = true;
          state.selectedEvent.reviewDecision = decision;
        }
        state.liveAlerts = state.liveAlerts.filter((a) => a.id !== eventId);
      });
  },
});

export const {
  setFilter,
  setSelectedEvent,
  eventFlagged,
  eventReviewed,
  addLiveAlert,
  removeLiveAlert,
} = reviewSlice.actions;

export default reviewSlice.reducer;
