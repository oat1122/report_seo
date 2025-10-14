import { UserFormState } from "@/types/user";
import {
  OverallMetricsForm,
  KeywordReportForm,
  KeywordRecommendForm,
} from "@/types/metrics";

// ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้ทั้งหมด
export const fetchUsersAPI = async () => {
  const response = await fetch("/api/users");
  if (!response.ok) throw new Error("Failed to fetch users");
  return await response.json();
};

// ฟังก์ชันสำหรับดึงข้อมูล SEO Devs
export const fetchSeoDevsAPI = async () => {
  const response = await fetch("/api/users/seodevs");
  if (!response.ok) throw new Error("Failed to fetch SEO Devs");
  return await response.json();
};

// ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้รายบุคคล (สำหรับ Customer)
export const fetchUserByIdAPI = async (id: string) => {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) throw new Error("Failed to fetch user details");
  return await response.json();
};

// ฟังก์ชันสำหรับบันทึกข้อมูล (สร้าง/อัปเดต)
export const saveUserAPI = async (user: UserFormState, isEditing: boolean) => {
  const url = isEditing ? `/api/users/${user.id}` : "/api/users";
  const method = isEditing ? "PUT" : "POST";

  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to save user");
  }
  return await response.json();
};

// ฟังก์ชันสำหรับลบผู้ใช้
export const deleteUserAPI = async (id: string) => {
  const response = await fetch(`/api/users/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete user");
};

// === Metrics API ===
export const fetchMetricsAPI = async (customerId: string) => {
  const response = await fetch(`/api/customers/${customerId}/metrics`);
  if (!response.ok) return null; // ไม่ต้อง throw error ถ้าไม่มีข้อมูล
  return await response.json();
};

export const saveMetricsAPI = async (
  customerId: string,
  metrics: OverallMetricsForm
) => {
  const response = await fetch(`/api/customers/${customerId}/metrics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(metrics),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to save metrics");
  }
  return await response.json();
};

// === Keywords API ===
export const fetchKeywordsAPI = async (customerId: string) => {
  const response = await fetch(`/api/customers/${customerId}/keywords`);
  if (!response.ok) throw new Error("Failed to fetch keywords");
  return await response.json();
};

export const addKeywordAPI = async (
  customerId: string,
  keyword: KeywordReportForm
) => {
  const response = await fetch(`/api/customers/${customerId}/keywords`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(keyword),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to add keyword");
  }
  return await response.json();
};

export const deleteKeywordAPI = async (keywordId: string) => {
  const response = await fetch(`/api/customers/keywords/${keywordId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete keyword");
};

// === Keyword Recommend API ===
export const fetchRecommendKeywordsAPI = async (customerId: string) => {
  const response = await fetch(
    `/api/customers/${customerId}/recommend-keywords`
  );
  if (!response.ok) throw new Error("Failed to fetch recommended keywords");
  return await response.json();
};

export const addRecommendKeywordAPI = async (
  customerId: string,
  keyword: KeywordRecommendForm
) => {
  const response = await fetch(
    `/api/customers/${customerId}/recommend-keywords`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(keyword),
    }
  );
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to add recommended keyword");
  }
  return await response.json();
};

export const deleteRecommendKeywordAPI = async (recommendId: string) => {
  const response = await fetch(
    `/api/customers/recommend-keywords/${recommendId}`,
    {
      method: "DELETE",
    }
  );
  if (!response.ok) throw new Error("Failed to delete recommended keyword");
};
