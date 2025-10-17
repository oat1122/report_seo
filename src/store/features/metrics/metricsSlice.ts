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
import { KeywordReportHistory } from "@/types/history";

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
};

// --- 3. Async Thunks ---
// Thunk ใหม่สำหรับดึงข้อมูล Report ทั้งหมด
export const fetchReportData = createAsyncThunk(
  "metrics/fetchReportData",
  async (customerId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/customers/${customerId}/report`);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch report data"
      );
    }
  }
);

// Thunks for Overall Metrics
export const fetchMetrics = createAsyncThunk(
  "metrics/fetchMetrics",
  async (customerId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/customers/${customerId}/metrics`);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch metrics"
      );
    }
  }
);

export const saveMetrics = createAsyncThunk(
  "metrics/saveMetrics",
  async (
    { customerId, data }: { customerId: string; data: OverallMetricsForm },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        `/customers/${customerId}/metrics`,
        data
      );
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to save metrics"
      );
    }
  }
);

// Thunks for Keyword Reports
export const fetchKeywords = createAsyncThunk(
  "metrics/fetchKeywords",
  async (customerId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/customers/${customerId}/keywords`);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch keywords"
      );
    }
  }
);

export const addKeyword = createAsyncThunk(
  "metrics/addKeyword",
  async (
    { customerId, data }: { customerId: string; data: KeywordReportForm },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        `/customers/${customerId}/keywords`,
        data
      );
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to add keyword"
      );
    }
  }
);

export const deleteKeyword = createAsyncThunk(
  "metrics/deleteKeyword",
  async (keywordId: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/customers/keywords/${keywordId}`);
      return keywordId;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to delete keyword"
      );
    }
  }
);

// Thunk for updating a keyword
export const updateKeyword = createAsyncThunk(
  "metrics/updateKeyword",
  async (
    { keywordId, data }: { keywordId: string; data: KeywordReportForm },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.put(
        `/customers/keywords/${keywordId}`,
        data
      );
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to update keyword"
      );
    }
  }
);

// Thunk for fetching keyword history
export const fetchKeywordHistory = createAsyncThunk(
  "metrics/fetchKeywordHistory",
  async (keywordId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `/customers/keywords/${keywordId}/history`
      );
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch history"
      );
    }
  }
);

// Thunks for Recommended Keywords
export const fetchRecommendKeywords = createAsyncThunk(
  "metrics/fetchRecommendKeywords",
  async (customerId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `/customers/${customerId}/recommend-keywords`
      );
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch recommended keywords"
      );
    }
  }
);

export const addRecommendKeyword = createAsyncThunk(
  "metrics/addRecommendKeyword",
  async (
    { customerId, data }: { customerId: string; data: KeywordRecommendForm },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        `/customers/${customerId}/recommend-keywords`,
        data
      );
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to add recommended keyword"
      );
    }
  }
);

export const deleteRecommendKeyword = createAsyncThunk(
  "metrics/deleteRecommendKeyword",
  async (recommendId: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/customers/recommend-keywords/${recommendId}`);
      return recommendId;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to delete recommended keyword"
      );
    }
  }
);

// --- 4. Slice Definition ---
const metricsSlice = createSlice({
  name: "metrics",
  initialState,
  reducers: {
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
        state.error = action.payload as string;
      })

      // Fetch all data (using fetchMetrics as the primary trigger)
      .addCase(fetchMetrics.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMetrics.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
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
        state.error = action.payload as string;
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

export const { clearMetricsState } = metricsSlice.actions;
export default metricsSlice.reducer;
