# report_seo

ระบบรายงาน SEO ให้ลูกค้า + workspace ของทีม (ADMIN · SEO_DEV · BLOG_WRITER · CUSTOMER)

Next.js 16 (App Router) · Prisma + MySQL/MariaDB · next-auth v4 (JWT) · custom server `server.ts` (Express + socket.io + node-cron)

## เริ่มใช้งาน (dev)

```bash
npm install
cp .env.example .env          # ใส่ค่าจริง — NEXTAUTH_SECRET สร้างด้วย npm run gen:secret
npx prisma migrate deploy
npm run seed                  # บัญชีทดสอบ (รหัสดูใน prisma/seed.ts) — ห้ามรันกับ production
npm run dev                   # http://localhost:3000 (เปลี่ยนด้วย PORT)
```

PDF เอกสารบิลใช้ Chromium ของ puppeteer: `npm run puppeteer:install` ครั้งแรก

## ตรวจก่อน deploy

```bash
npx tsc --noEmit
npm run lint
npm run test:run
npm run build
```

## Production

```bash
npm run deploy:prod           # install + migrate (.env.production) + build
npm start                     # server.ts แบบ NODE_ENV=production
```

หรือใช้ PM2: `pm2 start ecosystem.config.cjs`

- ต้องรันผ่าน `server.ts` (ไม่ใช่ `next start`) — socket.io, cron รายสัปดาห์ และการเสิร์ฟ `/uploads` ที่อัปโหลดหลัง boot อยู่ในนั้น
- 1 instance เท่านั้น (socket.io room + cron อยู่ใน memory) และห้ามเปิด PM2 watch (แอปเขียน `server/logs`, `public/uploads` ตลอด → restart วน)
- ไฟล์อัปโหลดอยู่ใน `public/uploads/` — ต้องเก็บข้าม deploy และ backup คู่กับ DB
- log: `server/logs/` (access log รายวัน + pino)

## Env

ดู `.env.example` — `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (https → cookie secure อัตโนมัติ), `AHREFS_API_KEY`, `PIN_Ahrefs_SYNC`; optional `PORT`, `LOG_LEVEL`, `ENABLE_AHREFS_CRON`

ห้าม commit `.env*` (ยกเว้น `.env.example` ที่เป็น placeholder) และ DB dump (`Dump/` ถูก ignore)
