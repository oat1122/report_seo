"use client";

import React from "react";
import Link from "next/link";

interface DashboardProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  return (
    <div className="container mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-text-dark mb-4">
          Admin Dashboard
        </h1>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            ยินดีต้อนรับ, <span className="font-semibold">{user.name}</span>!
          </p>
          <p className="text-blue-600 text-sm">
            บทบาท: {user.role} | อีเมล: {user.email}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/admin/users"
            className="block hover:bg-purple-100 rounded-lg transition-colors"
          >
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 h-full">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">
                จัดการผู้ใช้งาน
              </h3>
              <p className="text-purple-600 text-sm">
                เพิ่ม แก้ไข และลบผู้ใช้งานในระบบ
              </p>
            </div>
          </Link>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              ตั้งค่าระบบ
            </h3>
            <p className="text-green-600 text-sm">กำหนดค่าการทำงานของระบบ</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              รายงาน
            </h3>
            <p className="text-yellow-600 text-sm">ดูสถิติและรายงานต่างๆ</p>
          </div>
        </div>
      </div>
    </div>
  );
};
