import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api.js";

// Fetch student dashboard data (available exams + student attempts)
export const fetchStudentDashboard = createAsyncThunk(
  "student/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const [examsRes, attemptsRes] = await Promise.all([
        api.get("/exams").catch(() => ({ data: { data: [] } })),
        api.get("/attempts/my").catch(() => ({ data: { data: [] } })),
      ]);
      return {
        exams: examsRes.data.data || [],
        myAttempts: attemptsRes.data.data || [],
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load student dashboard");
    }
  }
);

const initialState = {
  exams: [],
  myAttempts: [],
  loading: false,
  error: null,
};

export const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentDashboard.fulfilled, (state, action) => {
        state.exams = action.payload.exams;
        state.myAttempts = action.payload.myAttempts;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchStudentDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default studentSlice.reducer;
