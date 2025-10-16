// src/store/features/users/usersSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "@/lib/axios"; // ใช้ axios instance ที่เราสร้าง
import { User, UserFormState } from "@/types/user";

// 1. กำหนด Interface ของ State
interface UsersState {
  users: User[];
  seoDevs: User[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// 2. กำหนด Initial State
const initialState: UsersState = {
  users: [],
  seoDevs: [],
  status: "idle",
  error: null,
};

// 3. สร้าง Async Thunks สำหรับเรียก API
// Thunk สำหรับดึงผู้ใช้ทั้งหมด
export const fetchUsers = createAsyncThunk("users/fetchUsers", async () => {
  const response = await axios.get<User[]>("/users");
  return response.data;
});

// Thunk สำหรับดึง SEO Devs
export const fetchSeoDevs = createAsyncThunk("users/fetchSeoDevs", async () => {
  const response = await axios.get<User[]>("/users/seodevs");
  return response.data;
});

// Thunk สำหรับเพิ่มผู้ใช้ใหม่
export const addUser = createAsyncThunk(
  "users/addUser",
  async (newUser: UserFormState, { rejectWithValue }) => {
    try {
      const response = await axios.post<User>("/users", newUser);
      return response.data;
    } catch (error: any) {
      // จัดการ error จาก API
      if (error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      }
      return rejectWithValue("Failed to add user");
    }
  }
);

// Thunk สำหรับอัปเดตผู้ใช้
export const updateUser = createAsyncThunk(
  "users/updateUser",
  async (updatedUser: UserFormState, { rejectWithValue }) => {
    try {
      const response = await axios.put<User>(
        `/users/${updatedUser.id}`,
        updatedUser
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      }
      return rejectWithValue("Failed to update user");
    }
  }
);

// Thunk สำหรับลบผู้ใช้ (Soft delete)
export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/users/${userId}`);
      // ส่งกลับ userId และวันที่ลบ
      return { userId, deletedAt: new Date().toISOString() };
    } catch (error: any) {
      if (error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      }
      return rejectWithValue("Failed to delete user");
    }
  }
);

// Thunk ใหม่สำหรับ Restore User
export const restoreUser = createAsyncThunk(
  "users/restoreUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      await axios.put(`/users/${userId}/restore`);
      return userId;
    } catch (error: any) {
      if (error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      }
      return rejectWithValue("Failed to restore user");
    }
  }
);

// 4. สร้าง Slice
const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Cases for fetchUsers
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.status = "succeeded";
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch users";
      })
      // Cases for fetchSeoDevs
      .addCase(
        fetchSeoDevs.fulfilled,
        (state, action: PayloadAction<User[]>) => {
          state.seoDevs = action.payload;
        }
      )
      // Cases for addUser
      .addCase(addUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.users.unshift(action.payload); // เพิ่ม user ใหม่ไว้บนสุด
        state.error = null; // Clear error on success
      })
      .addCase(addUser.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to add user";
      })
      // Cases for updateUser
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
        const index = state.users.findIndex(
          (user) => user.id === action.payload.id
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        state.error = null; // Clear error on success
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to update user";
      })
      // Cases for deleteUser (Soft Delete)
      .addCase(
        deleteUser.fulfilled,
        (
          state,
          action: PayloadAction<{ userId: string; deletedAt: string }>
        ) => {
          const index = state.users.findIndex(
            (user) => user.id === action.payload.userId
          );
          if (index !== -1) {
            state.users[index].deletedAt = action.payload.deletedAt;
          }
          state.error = null;
        }
      )
      .addCase(deleteUser.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to delete user";
      })
      // Cases for restoreUser
      .addCase(
        restoreUser.fulfilled,
        (state, action: PayloadAction<string>) => {
          const index = state.users.findIndex(
            (user) => user.id === action.payload
          );
          if (index !== -1) {
            state.users[index].deletedAt = null;
          }
          state.error = null;
        }
      )
      .addCase(restoreUser.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to restore user";
      });
  },
});

export default usersSlice.reducer;
