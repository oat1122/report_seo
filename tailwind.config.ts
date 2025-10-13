// tailwind.config.js

const defaultTheme = require("tailwindcss/defaultTheme"); // ต้อง import defaultTheme เข้ามา

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // ... ไฟล์สำหรับสแกน Tailwind CSS ของคุณ
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- Primary Colors ---
        "primary-purple": "#9592FF", // #9592ff
        "text-dark": "#2f2f2f", // #2f2f2f - สีเทาเข้มสำหรับ Background/Text
        "text-light": "#FFFFFF", // #FFFFFF - สีขาว
        "background-dark": "#2f2f2f", // Background สีดำ/เทาเข้ม
        "background-light": "#FFFFFF", // Background สีขาว

        // --- Secondary/Accent Colors ---
        "secondary-green": "#31ffb4", // #31ffb4 - สีเขียวนีออน
        "accent-black": "#6460F8", // สีม่วงเข้ม (เป็นไปได้ว่าใช้แทนสีดำในบางส่วน)
      },
      fontFamily: {
        // ** (1) กำหนดให้ Kanit เป็นฟอนต์หลักในกลุ่ม 'sans' **
        // อ้างอิงจาก CSS Variable: '--font-kanit' ที่ตั้งค่าใน app/layout.tsx
        sans: ["var(--font-kanit)", ...defaultTheme.fontFamily.sans],

        // ** (2) กำหนด 'kanit' เป็น Utility Class แยก (ตัวเลือกเสริม) **
        // ถ้าต้องการใช้ font-kanit ก็ยังใช้ได้
        kanit: ["var(--font-kanit)", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
