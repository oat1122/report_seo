# report-seo บน VPS 76.13.197.229 — build บนเครื่องปลายทางด้วย scripts/deploy.sh
# รันผ่าน server.ts (socket.io + cron + /uploads) ด้วย tsx เหมือนตอนอยู่ Hostatom → ต้องมี devDependencies ด้วย
FROM node:24-bookworm-slim

# chromium ของ Debian แทนตัวที่ puppeteer โหลดเอง (ตัวนั้นขาด lib ระบบใน slim) · ฟอนต์ไทยให้ PDF ใบแจ้งหนี้อ่านออก
RUN apt-get update \
 && apt-get install -y --no-install-recommends chromium fonts-thai-tlwg openssl ca-certificates curl \
 && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    NEXT_TELEMETRY_DISABLED=1 \
    TZ=Asia/Bangkok

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npx prisma generate && npx next build

ENV NODE_ENV=production PORT=3000
EXPOSE 3000
# migrate deploy ทุกครั้งที่ start = schema ตาม prisma/schema/migrations ของรุ่นที่ deploy ขึ้นไป
CMD ["sh", "-c", "npx prisma migrate deploy && exec node --import tsx server.ts"]
