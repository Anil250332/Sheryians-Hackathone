import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api.js";

export const fetchAttempt = createAsyncThunk(
  "exam/fetchAttempt",
  async (attemptId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/attempts/${attemptId}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load exam attempt");
    }
  }
);

const initialState = {
  currentAttempt: null,
  exam: null,
  violationCount: 0,
  activeAlert: null,
  isLocked: false,
  answers: {},
  loading: false,
  error: null,
};

export const examSlice = createSlice({
  name: "exam",
  initialState,
  reducers: {
    setViolationCount: (state, action) => {
      state.violationCount = action.payload;
    },
    incrementViolation: (state) => {
      state.violationCount += 1;
    },
    refundViolation: (state) => {
      state.violationCount = Math.max(0, state.violationCount - 1);
      state.isLocked = false;
      state.activeAlert = null;
    },
    setActiveAlert: (state, action) => {
      state.activeAlert = action.payload;
    },
    setIsLocked: (state, action) => {
      state.isLocked = action.payload;
    },
    setAnswer: (state, action) => {
      const { questionId, optionIndex } = action.payload;
      state.answers[questionId] = optionIndex;
    },
    clearExamSession: (state) => {
      state.currentAttempt = null;
      state.exam = null;
      state.violationCount = 0;
      state.activeAlert = null;
      state.isLocked = false;
      state.answers = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttempt.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAttempt.fulfilled, (state, action) => {
        state.currentAttempt = action.payload;
        state.exam = action.payload.examId;
        state.loading = false;
      })
      .addCase(fetchAttempt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setViolationCount,
  incrementViolation,
  refundViolation,
  setActiveAlert,
  setIsLocked,
  setAnswer,
  clearExamSession,
} = examSlice.actions;

export default examSlice.reducer;
