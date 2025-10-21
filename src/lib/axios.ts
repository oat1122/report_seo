// src/lib/axios.ts
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";

interface ApiError {
  error?: string;
  message?: string;
}

const axiosInstance = axios.create({
  baseURL: "/api", // กำหนด Base URL ของ API ทั้งหมด
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Add Response Interceptor for Centralized Error Handling ---
axiosInstance.interceptors.response.use(
  // On Success: Do nothing, just return the response
  (response) => response,
  // On Error: Handle it globally
  (error: AxiosError<ApiError>) => {
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      "เกิดข้อผิดพลาดที่ไม่คาดคิด";

    // Show a toast notification with error styling
    toast.error(errorMessage, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    // Reject the promise so that Redux Thunk's .rejected case is triggered
    return Promise.reject(error);
  }
);

export default axiosInstance;
