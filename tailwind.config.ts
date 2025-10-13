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
        // **กำหนด Kanit เป็นฟอนต์หลักในกลุ่ม 'sans'** // ฟอนต์อื่นๆ (Geist) ถูกใช้เป็น Fallback
        sans: [
          "var(--font-kanit)",
          "var(--font-geist-sans)",
          ...defaultTheme.fontFamily.sans,
        ],

        // กำหนดฟอนต์สำหรับโค้ด
        mono: ["var(--font-geist-mono)", ...defaultTheme.fontFamily.mono],

        // Utility Class แยกสำหรับ Kanit (font-kanit)
        kanit: ["var(--font-kanit)", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
