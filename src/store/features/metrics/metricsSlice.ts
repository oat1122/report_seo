// src/store/features/metrics/metricsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "@/lib/axios";
import {
  OverallMetrics,
  KeywordReport,
  KeywordRecommend,
  OverallMetricsForm,
  KeywordReportForm,
  KeywordRecommendForm,
} from "@/types/metrics";
import { KeywordReportHistory, OverallMetricsHistory } from "@/types/history";
import { User } from "@/types/user";

// --- 1. Interfaces ---
// Interface สำหรับข้อมูล Report
interface ReportData {
  metrics: OverallMetrics | null;
  topKeywords: KeywordReport[];
  otherKeywords: KeywordReport[];
  recommendations: KeywordRecommend[]; // เพิ่ม field นี้
  customerName: string | null;
  domain: string | null;
}

// Interface สำหรับประวัติรวม (Metrics + Keywords)
interface CombinedHistoryData {
  metricsHistory: OverallMetricsHistory[];
  keywordHistory: KeywordReportHistory[];
}

interface MetricsState {
  metrics: OverallMetrics | null;
  keywords: KeywordReport[];
  recommendKeywords: KeywordRecommend[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  // State ใหม่สำหรับ Report Page
  reportData: ReportData | null;
  reportStatus: "idle" | "loading" | "succeeded" | "failed";
  // State ใหม่สำหรับ Keyword History
  keywordHistory: KeywordReportHistory[];
  historyStatus: "idle" | "loading" | "succeeded" | "failed";
  // --- Modal States ---
  isMetricsModalOpen: boolean;
  selectedCustomerId: string | null;
  isHistoryModalOpen: boolean;
  isKeywordHistoryModalOpen: boolean;
  selectedKeyword: KeywordReport | null;
  historyData: CombinedHistoryData;
}

// --- 2. Initial State ---
const initialState: MetricsState = {
  metrics: null,
  keywords: [],
  recommendKeywords: [],
  status: "idle",
  error: null,
  // ค่าเริ่มต้นสำหรับ Report State
  reportData: null,
  reportStatus: "idle",
  // ค่าเริ่มต้นสำหรับ Keyword History
  keywordHistory: [],
  historyStatus: "idle",
  // --- ค่าเริ่มต้นสำหรับ Modal State ---
  isMetricsModalOpen: false,
  selectedCustomerId: null,
  isHistoryModalOpen: false,
  isKeywordHistoryModalOpen: false,
  selectedKeyword: null,
  historyData: { metricsHistory: [], keywordHistory: [] },
};

// --- 3. Async Thunks ---
// Thunk ใหม่สำหรับดึงข้อมูล Report ทั้งหมด
export const fetchReportData = createAsyncThunk(
  "metrics/fetchReportData",
  async (customerId: string) => {
    const response = await axios.get(`/customers/${customerId}/report`);
    return response.data;
  }
);

// Thunks for Overall Metrics
export const fetchMetrics = createAsyncThunk(
  "metrics/fetchMetrics",
  async (customerId: string) => {
    const response = await axios.get(`/customers/${customerId}/metrics`);
    return response.data;
  }
);

export const saveMetrics = createAsyncThunk(
  "metrics/saveMetrics",
  async ({
    customerId,
    data,
  }: {
    customerId: string;
    data: OverallMetricsForm;
  }) => {
    const response = await axios.post(`/customers/${customerId}/metrics`, data);
    return response.data;
  }
);

// Thunks for Keyword Reports
export const fetchKeywords = createAsyncThunk(
  "metrics/fetchKeywords",
  async (customerId: string) => {
    const response = await axios.get(`/customers/${customerId}/keywords`);
    return response.data;
  }
);

export const addKeyword = createAsyncThunk(
  "metrics/addKeyword",
  async ({
    customerId,
    data,
  }: {
    customerId: string;
    data: KeywordReportForm;
  }) => {
    const response = await axios.post(
      `/customers/${customerId}/keywords`,
      data
    );
    return response.data;
  }
);

export const deleteKeyword = createAsyncThunk(
  "metrics/deleteKeyword",
  async (keywordId: string) => {
    await axios.delete(`/customers/keywords/${keywordId}`);
    return keywordId;
  }
);

// Thunk for updating a keyword
export const updateKeyword = createAsyncThunk(
  "metrics/updateKeyword",
  async ({
    keywordId,
    data,
  }: {
    keywordId: string;
    data: KeywordReportForm;
  }) => {
    const response = await axios.put(`/customers/keywords/${keywordId}`, data);
    return response.data;
  }
);

// Thunk for fetching keyword history
export const fetchKeywordHistory = createAsyncThunk(
  "metrics/fetchKeywordHistory",
  async (keywordId: string) => {
    const response = await axios.get(
      `/customers/keywords/${keywordId}/history`
    );
    return response.data;
  }
);

// Thunk for fetching combined history data (metrics + keywords)
export const fetchHistoryData = createAsyncThunk(
  "metrics/fetchHistoryData",
  async (customerId: string) => {
    const response = await axios.get(
      `/customers/${customerId}/metrics/history`
    );
    return response.data as CombinedHistoryData;
  }
);

// Thunks for Recommended Keywords
export const fetchRecommendKeywords = createAsyncThunk(
  "metrics/fetchRecommendKeywords",
  async (customerId: string) => {
    const response = await axios.get(
      `/customers/${customerId}/recommend-keywords`
    );
    return response.data;
  }
);

export const addRecommendKeyword = createAsyncThunk(
  "metrics/addRecommendKeyword",
  async ({
    customerId,
    data,
  }: {
    customerId: string;
    data: KeywordRecommendForm;
  }) => {
    const response = await axios.post(
      `/customers/${customerId}/recommend-keywords`,
      data
    );
    return response.data;
  }
);

export const deleteRecommendKeyword = createAsyncThunk(
  "metrics/deleteRecommendKeyword",
  async (recommendId: string) => {
    await axios.delete(`/customers/recommend-keywords/${recommendId}`);
    return recommendId;
  }
);

// --- 4. Slice Definition ---
const metricsSlice = createSlice({
  name: "metrics",
  initialState,
  reducers: {
    // --- Reducers สำหรับจัดการ Modal ---
    openMetricsModal: (state, action: PayloadAction<User>) => {
      state.isMetricsModalOpen = true;
      state.selectedCustomerId = action.payload.id;
    },
    closeMetricsModal: (state) => {
      state.isMetricsModalOpen = false;
      state.selectedCustomerId = null;
      // Reset related states
      state.metrics = null;
      state.keywords = [];
      state.recommendKeywords = [];
      state.historyData = { metricsHistory: [], keywordHistory: [] };
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
      state.keywordHistory = [];
    },
    clearMetricsState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // === Reducers สำหรับ Report Page ===
      .addCase(fetchReportData.pending, (state) => {
        state.reportStatus = "loading";
      })
      .addCase(
        fetchReportData.fulfilled,
        (state, action: PayloadAction<ReportData>) => {
          state.reportStatus = "succeeded";
          state.reportData = action.payload;
        }
      )
      .addCase(fetchReportData.rejected, (state, action) => {
        state.reportStatus = "failed";
        state.error = action.error.message || "Failed to fetch report data";
      })

      // Fetch all data (using fetchMetrics as the primary trigger)
      .addCase(fetchMetrics.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMetrics.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch metrics";
      })
      .addCase(
        fetchMetrics.fulfilled,
        (state, action: PayloadAction<OverallMetrics | null>) => {
          state.metrics = action.payload;
          // We can assume other fetches are also successful if this one is
          state.status = "succeeded";
        }
      )
      .addCase(
        fetchKeywords.fulfilled,
        (state, action: PayloadAction<KeywordReport[]>) => {
          state.keywords = action.payload;
        }
      )
      .addCase(
        fetchRecommendKeywords.fulfilled,
        (state, action: PayloadAction<KeywordRecommend[]>) => {
          state.recommendKeywords = action.payload;
        }
      )

      // Save Metrics
      .addCase(
        saveMetrics.fulfilled,
        (state, action: PayloadAction<OverallMetrics>) => {
          state.metrics = action.payload;
        }
      )

      // Add Keyword
      .addCase(
        addKeyword.fulfilled,
        (state, action: PayloadAction<KeywordReport>) => {
          state.keywords.push(action.payload);
        }
      )

      // Delete Keyword
      .addCase(
        deleteKeyword.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.keywords = state.keywords.filter(
            (kw) => kw.id !== action.payload
          );
        }
      )

      // Update Keyword
      .addCase(
        updateKeyword.fulfilled,
        (state, action: PayloadAction<KeywordReport>) => {
          const index = state.keywords.findIndex(
            (kw) => kw.id === action.payload.id
          );
          if (index !== -1) {
            state.keywords[index] = action.payload;
          }
        }
      )

      // Fetch Combined History Data
      .addCase(
        fetchHistoryData.fulfilled,
        (state, action: PayloadAction<CombinedHistoryData>) => {
          state.historyData = action.payload;
          state.isHistoryModalOpen = true;
        }
      )

      // Fetch Keyword History
      .addCase(fetchKeywordHistory.pending, (state) => {
        state.historyStatus = "loading";
      })
      .addCase(
        fetchKeywordHistory.fulfilled,
        (state, action: PayloadAction<KeywordReportHistory[]>) => {
          state.historyStatus = "succeeded";
          state.keywordHistory = action.payload;
        }
      )
      .addCase(fetchKeywordHistory.rejected, (state, action) => {
        state.historyStatus = "failed";
        state.error = action.error.message || "Failed to fetch keyword history";
      })

      // Add Recommend Keyword
      .addCase(
        addRecommendKeyword.fulfilled,
        (state, action: PayloadAction<KeywordRecommend>) => {
          state.recommendKeywords.push(action.payload);
        }
      )

      // Delete Recommend Keyword
      .addCase(
        deleteRecommendKeyword.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.recommendKeywords = state.recommendKeywords.filter(
            (kw) => kw.id !== action.payload
          );
        }
      );
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
