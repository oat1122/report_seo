const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // ... ไฟล์สำหรับสแกน Tailwind CSS ของคุณ
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // เพิ่ม src/ เพื่อรองรับ App Router
  ],
  theme: {
    extend: {
      colors: {
        // --- Primary Colors (ตามดีไซน์) ---
        "primary-purple": "#9592FF", // #9592ff
        "text-dark": "#2f2f2f",
        "text-light": "#FFFFFF",
        "background-dark": "#2f2f2f",
        "background-light": "#FFFFFF",

        // --- Secondary/Accent Colors (ตามดีไซน์) ---
        "secondary-green": "#31ffb4", // #31ffb4
        "accent-purple-dark": "#6460F8", // #6460F8
      },
      fontFamily: {
        // ให้ font-sans ใช้ Kanit เป็นหลัก (via CSS Variable)
        // **การมีคลาส font-sans สำคัญในการรับรองว่า Tailwind Utilities ทำงานได้**
        sans: [
          "var(--font-kanit)",
          "var(--font-geist-sans)",
          ...defaultTheme.fontFamily.sans,
        ],
        // ลบ utility class 'kanit' ที่ซ้ำซ้อนออก
        mono: ["var(--font-geist-mono)", ...defaultTheme.fontFamily.mono],
      },
    },
  },
  plugins: [],
};
