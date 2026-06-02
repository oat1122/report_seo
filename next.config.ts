import type { NextConfig } from 'next'

const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://placehold.jp",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ')

const nextConfig: NextConfig = {
  // pino-pretty transport ใช้ thread-stream worker ที่ dynamic-require target ตามชื่อ
  // bundler resolve string path ไม่ได้ ต้อง externalize ใส่ pino ด้วยเป็น belt-and-suspenders
  // ตามคำแนะนำของ Next docs
  //
  // puppeteer: ถ้าถูก bundle เข้า build, logic หา Chromium executable (resolve path
  // อิงตำแหน่ง node_modules/puppeteer ของตัวเอง) จะพังเพราะ path ชี้เข้า .next แทน →
  // launch() throw → route สร้างเอกสาร PDF 500. ต้อง externalize ให้ require จาก
  // node_modules ตอน runtime
  serverExternalPackages: ['pino', 'pino-pretty', 'puppeteer'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.jp',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Security Headers เพื่อป้องกันการโจมตีพื้นฐาน
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN', // ป้องกัน Clickjacking
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // ป้องกัน MIME Sniffing
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: contentSecurityPolicy,
          },
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=()',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
  poweredByHeader: false, // ซ่อน X-Powered-By header
}

export default nextConfig
