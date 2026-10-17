import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import reviewReducer from "./slices/reviewSlice.js";
import teacherReducer from "./slices/teacherSlice.js";
import examReducer from "./slices/examSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    reviews: reviewReducer,
    teacher: teacherReducer,
    exam: examReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Allows Date objects & base64 buffers
    }),
});

export default store;
