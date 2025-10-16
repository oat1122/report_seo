// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "./features/users/usersSlice";

export const store = configureStore({
  reducer: {
    users: usersReducer,
    // ... สามารถเพิ่ม reducers อื่นๆ ได้ที่นี่
  },
});

// สร้าง Type สำหรับ State และ Dispatch เพื่อให้ TypeScript รู้จัก
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
