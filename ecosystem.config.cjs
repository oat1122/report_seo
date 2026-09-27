// PM2: `pm2 start ecosystem.config.cjs` หลัง `npm run deploy:prod`
// - fork 1 instance เท่านั้น: socket.io room + node-cron อยู่ใน memory ของ process
//   (cluster/หลาย instance = noti realtime หาย + cron รายสัปดาห์ยิงซ้ำ)
// - watch ต้องปิด: แอปเขียน server/logs และ public/uploads ตลอด → เปิด watch = restart วนทุกครั้งที่มี request/upload
module.exports = {
  apps: [
    {
      name: 'report-seo',
      script: 'server.ts',
      interpreter: 'node',
      interpreter_args: '--import tsx',
      env: { NODE_ENV: 'production' },
      exec_mode: 'fork',
      instances: 1,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
}
