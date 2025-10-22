// src/store/features/metrics/metricsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { KeywordReport } from "@/types/metrics";
import { User } from "@/types/user";

// --- 1. State Interface (UI State เท่านั้น) ---
interface MetricsState {
  // --- Modal States ---
  isMetricsModalOpen: boolean;
  selectedCustomerId: string | null;
  isHistoryModalOpen: boolean;
  isKeywordHistoryModalOpen: boolean;
  selectedKeyword: KeywordReport | null;
}

// --- 2. Initial State ---
const initialState: MetricsState = {
  isMetricsModalOpen: false,
  selectedCustomerId: null,
  isHistoryModalOpen: false,
  isKeywordHistoryModalOpen: false,
  selectedKeyword: null,
};

// --- 3. Slice Definition (UI State เท่านั้น) ---
const metricsSlice = createSlice({
  name: "metrics",
  initialState,
  reducers: {
    openMetricsModal: (state, action: PayloadAction<User>) => {
      state.isMetricsModalOpen = true;
      state.selectedCustomerId = action.payload.id;
    },
    closeMetricsModal: (state) => {
      state.isMetricsModalOpen = false;
      state.selectedCustomerId = null;
    },
    openHistoryModal: (state) => {
      state.isHistoryModalOpen = true;
    },
    closeHistoryModal: (state) => {
      state.isHistoryModalOpen = false;
    },
    openKeywordHistoryModal: (state, action: PayloadAction<KeywordReport>) => {
      state.isKeywordHistoryModalOpen = true;
      state.selectedKeyword = action.payload;
    },
    closeKeywordHistoryModal: (state) => {
      state.isKeywordHistoryModalOpen = false;
      state.selectedKeyword = null;
    },
    clearMetricsState: () => initialState,
  },
});

export const {
  clearMetricsState,
  openMetricsModal,
  closeMetricsModal,
  openHistoryModal,
  closeHistoryModal,
  openKeywordHistoryModal,
  closeKeywordHistoryModal,
} = metricsSlice.actions;

export default metricsSlice.reducer;
