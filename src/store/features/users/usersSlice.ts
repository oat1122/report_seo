// src/store/features/users/usersSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "@/lib/axios"; // ใช้ axios instance ที่เราสร้าง
import { User, UserFormState } from "@/types/user";
import { Role } from "@/types/auth";

// 1. กำหนด Interface ของ State
interface UsersState {
  users: User[];
  seoDevs: User[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  // --- UI State Management ---
  isModalOpen: boolean;
  isEditing: boolean;
  currentUser: UserFormState | null;
  confirmState: {
    isOpen: boolean;
    title: string;
    message: string;
    // --- เปลี่ยนจากเก็บ function มาเก็บ action type และ targetId ---
    actionType: "delete" | "restore" | null;
    targetId: string | null;
  };
}

// 2. กำหนด Initial State
const initialState: UsersState = {
  users: [],
  seoDevs: [],
  status: "idle",
  error: null,
  // --- ค่าเริ่มต้นสำหรับ UI State ---
  isModalOpen: false,
  isEditing: false,
  currentUser: null,
  confirmState: {
    isOpen: false,
    title: "",
    message: "",
    actionType: null,
    targetId: null,
  },
};

// 3. สร้าง Async Thunks สำหรับเรียก API
// Thunk สำหรับดึงผู้ใช้ทั้งหมด
export const fetchUsers = createAsyncThunk("users/fetchUsers", async () => {
  // เพิ่ม params: { includeDeleted: true } เข้าไปในการเรียก API
  const response = await axios.get<User[]>("/users", {
    params: { includeDeleted: true },
  });
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
  async (newUser: UserFormState) => {
    const response = await axios.post<User>("/users", newUser);
    return response.data;
  }
);

// Thunk สำหรับอัปเดตผู้ใช้
export const updateUser = createAsyncThunk(
  "users/updateUser",
  async (updatedUser: UserFormState) => {
    const response = await axios.put<User>(
      `/users/${updatedUser.id}`,
      updatedUser
    );
    return response.data;
  }
);

// Thunk สำหรับลบผู้ใช้ (Soft delete)
export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (userId: string) => {
    await axios.delete(`/users/${userId}`);
    // ส่งกลับ userId และวันที่ลบ
    return { userId, deletedAt: new Date().toISOString() };
  }
);

// Thunk ใหม่สำหรับ Restore User
export const restoreUser = createAsyncThunk(
  "users/restoreUser",
  async (userId: string) => {
    await axios.put(`/users/${userId}/restore`);
    return userId;
  }
);

// Thunk for updating password
export const updatePassword = createAsyncThunk(
  "users/updatePassword",
  async ({
    userId,
    values,
  }: {
    userId: string;
    values: Partial<UserFormState>;
  }) => {
    await axios.put(`/users/${userId}/password`, values);
    return userId;
  }
);

// 4. สร้าง Slice
const usersSlice = createSlice({
  name: "users",
  initialState,
  // --- เพิ่ม Reducers สำหรับจัดการ UI State ---
  reducers: {
    openUserModal: (state, action: PayloadAction<User | undefined>) => {
      state.isModalOpen = true;
      state.isEditing = !!action.payload;
      if (action.payload) {
        state.currentUser = action.payload;
      } else {
        state.currentUser = { role: Role.CUSTOMER }; // Default for new user
      }
    },
    closeUserModal: (state) => {
      state.isModalOpen = false;
      state.isEditing = false;
      state.currentUser = null;
    },
    setCurrentUser: (state, action: PayloadAction<Partial<UserFormState>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      } else {
        state.currentUser = action.payload as UserFormState;
      }
    },
    showConfirmation: (
      state,
      action: PayloadAction<{
        title: string;
        message: string;
        actionType: "delete" | "restore";
        targetId: string;
      }>
    ) => {
      state.confirmState = {
        isOpen: true,
        title: action.payload.title,
        message: action.payload.message,
        actionType: action.payload.actionType,
        targetId: action.payload.targetId,
      };
    },
    hideConfirmation: (state) => {
      state.confirmState.isOpen = false;
      state.confirmState.title = "";
      state.confirmState.message = "";
      state.confirmState.actionType = null;
      state.confirmState.targetId = null;
    },
    clearUserError: (state) => {
      state.error = null;
    },
  },
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
        state.isModalOpen = false; // ปิด Modal เมื่อสำเร็จ
        state.error = null; // Clear error on success
      })
      .addCase(addUser.rejected, (state, action) => {
        state.error = action.error.message || "Failed to add user";
      })
      // Cases for updateUser
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
        const index = state.users.findIndex(
          (user) => user.id === action.payload.id
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        state.isModalOpen = false; // ปิด Modal เมื่อสำเร็จ
        state.error = null; // Clear error on success
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.error = action.error.message || "Failed to update user";
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
        state.error = action.error.message || "Failed to delete user";
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
        state.error = action.error.message || "Failed to restore user";
      })
      // Cases for updatePassword
      .addCase(updatePassword.fulfilled, (state) => {
        state.isModalOpen = false; // ปิด Modal เมื่อสำเร็จ
        state.error = null;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.error = action.error.message || "Failed to update password";
      });
  },
});

// --- Export actions ---
export const {
  openUserModal,
  closeUserModal,
  setCurrentUser,
  showConfirmation,
  hideConfirmation,
  clearUserError,
} = usersSlice.actions;

export default usersSlice.reducer;
