import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Kanit } from "next/font/google";
import "./globals.css";

// 1. กำหนดค่าฟอนต์ Kanit (ฟอนต์หลักภาษาไทย/Sans)
const kanit = Kanit({
  subsets: ["latin", "thai"],
  // โหลดน้ำหนักที่ใช้: Regular (400), Medium (500), Bold (700)
  weight: ["400", "500", "700"],
  variable: "--font-kanit",
});

// กำหนด Geist เป็นฟอนต์สำรอง (Geist Sans)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// กำหนด Geist Mono สำหรับโค้ด (ถ้ามี)
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // แนะนำให้เปลี่ยน title/description ให้สื่อความหมายมากขึ้น
  title: "SEO Report Dashboard",
  description: "Dashboard for SEO keyword and domain reports",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // กำหนด CSS Variable ของฟอนต์ทั้งหมด และให้ Kanit เป็นคลาสเริ่มต้น
    <html
      lang="th"
      className={`${kanit.variable} ${geistSans.variable} ${geistMono.variable} ${kanit.className}`}
    >
      {/* font-sans ใน body จะใช้ฟอนต์ Kanit ตามที่กำหนดใน tailwind.config.ts */}
      <body className={`font-sans antialiased`}>{children}</body>
    </html>
  );
}
