// src/middleware.ts
import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { Role } from "@/types/auth";

export default withAuth(
  // `withAuth` จะเพิ่มข้อมูล token ของผู้ใช้เข้ามาใน `Request`
  function middleware(request: NextRequestWithAuth) {
    const { token } = request.nextauth;
    const { pathname } = request.nextUrl;

    // Helper function สำหรับตรวจสอบ prefix ของ path
    const isPath = (path: string) => pathname.startsWith(path);

    // ถ้าไม่มี token หรือ role ให้ redirect ไปหน้า login
    if (!token || !token.role) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const userRole = token.role as Role;

    // --- ตรวจสอบสิทธิ์ Admin ---
    // Admin สามารถเข้าถึงได้ทุกหน้าที่ถูกป้องกัน
    if (userRole === Role.ADMIN) {
      return NextResponse.next();
    }

    // --- ตรวจสอบสิทธิ์ Staff (SEO_DEV) ---
    if (userRole === Role.SEO_DEV) {
      // SEO Dev ห้ามเข้าหน้า /admin
      if (isPath("/admin")) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
      // แต่สามารถเข้าหน้าอื่น ๆ ที่ไม่ใช่ของ Customer ได้ (เช่น /seo)
      if (!isPath("/customer")) {
        return NextResponse.next();
      }
    }

    // --- ตรวจสอบสิทธิ์ Customer ---
    if (userRole === Role.CUSTOMER) {
      // Customer เข้าได้เฉพาะหน้า /customer เท่านั้น
      if (isPath("/customer")) {
        return NextResponse.next();
      }
    }

    // --- กรณี Default: ถ้าไม่เข้าเงื่อนไขใดๆ เลย ---
    // ให้ถือว่าไม่มีสิทธิ์และ redirect ไปหน้า /unauthorized
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  },
  {
    callbacks: {
      // Callback นี้จะถูกเรียกก่อน middleware หลักทำงาน
      // ถ้า return false ผู้ใช้จะถูก redirect ไปยังหน้า signIn ใน authOptions
      authorized: ({ token }) => !!token,
    },
  }
);

// --- Matcher Configuration ---
// ระบุ path ทั้งหมดที่ต้องการให้ middleware นี้ทำงาน
export const config = {
  matcher: ["/admin/:path*", "/seo/:path*", "/customer/:path*"],
};
