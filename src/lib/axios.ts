// src/lib/axios.ts
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api", // กำหนด Base URL ของ API ทั้งหมด
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
