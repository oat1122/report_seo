// app/layout.tsx (ฉบับปรับปรุง)

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Kanit } from "next/font/google"; // นำเข้าแค่ครั้งเดียว
import "./globals.css"; // นำเข้าแค่ครั้งเดียว

// 1. กำหนดค่าฟอนต์ Kanit
const kanit = Kanit({
  subsets: ["latin", "thai"],
  weight: ["400", "500", "700"],
  variable: "--font-kanit",
});

// กำหนด Geist เป็นฟอนต์สำรองหรือฟอนต์ Sans ทั่วไป
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // ...
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // กำหนด Kanit เป็นฟอนต์หลัก (Base Font)
    // และกำหนด Geist เป็น CSS Variable เพื่อให้ Tailwind ใช้เป็นฟอนต์สำรอง
    <html
      lang="th"
      className={`${kanit.variable} ${geistSans.variable} ${kanit.className}`}
    >
      <body className={`font-sans antialiased`}>{children}</body>
    </html>
  );
}
