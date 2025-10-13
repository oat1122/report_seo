// import type { Config } from "tailwindcss";
// import tailwindcssAnimate from "tailwindcss-animate";

// const config: Config = {
//   darkMode: ["class"],
//   content: [
//     "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
//   ],
//   theme: {
//     container: {
//       center: true,
//       padding: "2rem",
//       screens: {
//         "2xl": "1400px",
//       },
//     },
//     extend: {
//       fontFamily: {
//         // กำหนดให้ --font-kanit ที่ตั้งค่าไว้ใน layout.tsx เป็นฟอนต์หลัก
//         sans: ["var(--font-kanit)", "sans-serif"],
//         geist: ["var(--font-geist-sans)", "sans-serif"],
//       },
//       colors: {
//         border: "hsl(var(--border))",
//         input: "hsl(var(--input))",
//         ring: "hsl(var(--ring))",
//         background: {
//           DEFAULT: "hsl(var(--background))", // #FFFFFF
//           dark: "hsl(var(--background-dark))", // #0D1117
//           muted: "hsl(var(--background-muted))", // #F7FAFC
//         },
//         foreground: "hsl(var(--foreground))", // #1A202C
//         primary: {
//           DEFAULT: "hsl(var(--primary))", // #1A284D
//           foreground: "hsl(var(--primary-foreground))", // #FFFFFF
//           accent: "hsl(var(--primary-accent))", // #00A3FF (จากเว็บ seoprime)
//         },
//         secondary: {
//           DEFAULT: "hsl(var(--secondary))", // #00F0B5
//           foreground: "hsl(var(--secondary-foreground))", // #0D1117
//         },
//         destructive: {
//           DEFAULT: "hsl(var(--destructive))", // #ef4444
//           foreground: "hsl(var(--destructive-foreground))",
//         },
//         muted: {
//           DEFAULT: "hsl(var(--muted))",
//           foreground: "hsl(var(--muted-foreground))", // #718096
//         },
//         accent: {
//           DEFAULT: "hsl(var(--accent))", // #00A3FF
//           foreground: "hsl(var(--accent-foreground))",
//         },
//         popover: {
//           DEFAULT: "hsl(var(--popover))",
//           foreground: "hsl(var(--popover-foreground))",
//         },
//         card: {
//           DEFAULT: "hsl(var(--card))",
//           foreground: "hsl(var(--card-foreground))",
//         },
//       },
//       borderRadius: {
//         lg: `var(--radius)`,
//         md: `calc(var(--radius) - 2px)`,
//         sm: "calc(var(--radius) - 4px)",
//       },
//       keyframes: {
//         "accordion-down": {
//           from: { height: "0" },
//           to: { height: "var(--radix-accordion-content-height)" },
//         },
//         "accordion-up": {
//           from: { height: "var(--radix-accordion-content-height)" },
//           to: { height: "0" },
//         },
//       },
//       animation: {
//         "accordion-down": "accordion-down 0.2s ease-out",
//         "accordion-up": "accordion-up 0.2s ease-out",
//       },
//     },
//   },
//   plugins: [tailwindcssAnimate],
// };

// export default config;
