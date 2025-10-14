import { UserFormState } from "@/types/user";

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
