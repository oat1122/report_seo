// src/store/features/users/usersSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserFormState } from "@/types/user";
import { Role } from "@/types/auth";

// 1. กำหนด Interface ของ State (UI State เท่านั้น)
interface UsersState {
  // --- UI State Management ---
  isModalOpen: boolean;
  isEditing: boolean;
  currentUser: UserFormState | null;
  confirmState: {
    isOpen: boolean;
    title: string;
    message: string;
    actionType: "delete" | "restore" | null;
    targetId: string | null;
  };
}

// 2. กำหนด Initial State
const initialState: UsersState = {
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

// 3. สร้าง Slice (UI State เท่านั้น)
const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    openUserModal: (
      state,
      action: PayloadAction<Partial<UserFormState> | undefined>
    ) => {
      state.isModalOpen = true;
      state.isEditing = !!action.payload?.id;
      if (action.payload) {
        state.currentUser = action.payload as UserFormState;
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
  },
});

// --- Export actions ---
export const {
  openUserModal,
  closeUserModal,
  setCurrentUser,
  showConfirmation,
  hideConfirmation,
} = usersSlice.actions;

export default usersSlice.reducer;
