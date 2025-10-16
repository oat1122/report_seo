// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "./features/users/usersSlice";
import metricsReducer from "./features/metrics/metricsSlice";

export const store = configureStore({
  reducer: {
    users: usersReducer,
    metrics: metricsReducer,
  },
});

// สร้าง Type สำหรับ State และ Dispatch เพื่อให้ TypeScript รู้จัก
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
