import { afterEach } from 'vitest'

// setup นี้รันทุกไฟล์เทสต์ — ส่วน DOM ต้อง guard ไว้ ไม่งั้นเทสต์ฝั่ง node จะพังตอน import react-dom
if (typeof window !== 'undefined') {
  const { cleanup } = await import('@testing-library/react')
  // `globals: false` ทำให้ auto-cleanup ของ testing-library ไม่ทำงานเอง ต้องผูก afterEach ตรงนี้
  afterEach(cleanup)

  // jsdom ยังไม่มี API เหล่านี้ — Radix ใช้ตอนวัดขนาด/จัดตำแหน่ง popup layer
  window.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.matchMedia ??= (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList
  Element.prototype.scrollIntoView = () => {}
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.setPointerCapture = () => {}
  Element.prototype.releasePointerCapture = () => {}
}
