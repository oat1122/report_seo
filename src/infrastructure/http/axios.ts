import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";

interface ApiError {
  error?: string;
  message?: string;
}

const axiosInstance = axios.create({
  baseURL: "/api",
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      "เกิดข้อผิดพลาดที่ไม่คาดคิด";

    toast.error(errorMessage, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    return Promise.reject(error);
  },
);

export default axiosInstance;
