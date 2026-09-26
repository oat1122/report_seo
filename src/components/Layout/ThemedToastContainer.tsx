'use client'

import type { CSSProperties } from 'react'
import { ToastContainer } from 'react-toastify'

// UI Kit v1.0 (Toast) — toast เป็นกระจกสีเข้มทั้ง light/dark mode จึงล็อก theme="dark"
// แล้วแทนค่าตัวแปรของ react-toastify ด้วย token (สไตล์ใน ReactToastify.css ไม่อยู่ใน @layer
// จะชนะ utility ของ Tailwind — จึงปรับผ่านตัวแปร CSS แทน class)
const toastTokens = {
  '--toastify-color-dark': 'var(--toast)',
  '--toastify-text-color-dark': 'white',
  '--toastify-toast-width': '380px',
  '--toastify-toast-min-height': '56px',
  '--toastify-toast-padding': '14px',
  '--toastify-toast-bd-radius': '18px',
  '--toastify-toast-shadow': 'var(--shadow-toast)',
  // ตำแหน่งต้องตั้งตรง ๆ — --toastify-toast-bottom คำนวณไว้แล้วที่ :root จาก offset 16px
  '--toastify-toast-bottom': 'max(24px, env(safe-area-inset-bottom))',
  '--toastify-toast-right': 'max(24px, env(safe-area-inset-right))',
  '--toastify-font-family': 'inherit',
  '--toastify-color-progress-dark': 'var(--secondary)',
  '--toastify-color-progress-success': 'var(--secondary)',
  '--toastify-color-progress-info': 'var(--info)',
  '--toastify-color-progress-warning': 'var(--warning-accent)',
  '--toastify-color-progress-error': 'var(--destructive)',
  '--toastify-color-progress-bgo': '0.06',
  '--toastify-icon-color-success': 'var(--secondary)',
  '--toastify-icon-color-info': 'var(--info)',
  '--toastify-icon-color-warning': 'var(--warning-accent)',
  '--toastify-icon-color-error': 'var(--destructive)',
  '--toastify-spinner-color': 'var(--info)',
  '--toastify-spinner-color-empty-area': 'rgb(255 255 255 / 0.12)',
} as CSSProperties

export const ThemedToastContainer = () => {
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      limit={3}
      theme="dark"
      style={toastTokens}
      // มือถือ (≤480px — media ของ react-toastify) react-toastify ทำ toast เต็มจอมุมเหลี่ยม → เว้นขอบ 16 + คืนมุม 18
      className="max-[481px]:px-4 max-[481px]:pb-4 [&_.Toastify__progress-bar--wrp]:h-[3px]!"
      toastClassName="border border-white/10 text-sm leading-snug backdrop-blur-md max-[481px]:mt-2! max-[481px]:rounded-[18px]!"
    />
  )
}
