// src/app/layout.tsx (โค้ดที่สะอาด)
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Kanit } from "next/font/google";
import "./globals.css";

// 1. กำหนดค่าฟอนต์ Kanit (ฟอนต์หลักภาษาไทย/Sans)
const kanit = Kanit({
  subsets: ["latin", "thai"],
  // โหลดน้ำหนักที่ใช้: Regular (400), Medium (500), Bold (700)
  weight: ["400", "500", "700"],
  variable: "--font-kanit", // ใช้ variable เพื่อให้ Tailwind ใช้ได้
});

// กำหนด Geist เป็นฟอนต์สำรอง (ใช้เฉพาะ variable)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SEO Report Dashboard",
  description: "Dashboard for SEO keyword and domain reports",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // กำหนด CSS Variable ของฟอนต์ทั้งหมด
    <html lang="th" className={`${kanit.variable} ${geistSans.variable}`}>
      {/* ใช้ kanit.className บน body โดยตรงเพื่อบังคับให้ Kanit เป็นฟอนต์หลัก
          (คลาสนี้จะถูกกำหนด font-family โดย Next.js) */}
      <body className={`${kanit.className} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
