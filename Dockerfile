# ---- Base ----
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl

# ---- Dependencies ----
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

# ---- Build ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate && npm run build

# ---- Production ----
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/docker-entrypoint.sh ./docker-entrypoint.sh

# Next.js standalone output (ถ้าเปิด output: 'standalone' ใน next.config.ts)
# ตอนนี้ใช้ next start ปกติ จึง copy .next ทั้งก้อน + node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# uploads dir สำหรับ file upload runtime
RUN mkdir -p public/uploads && chown -R nextjs:nodejs public/uploads
RUN chown -R nextjs:nodejs .next
RUN chmod +x docker-entrypoint.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]
