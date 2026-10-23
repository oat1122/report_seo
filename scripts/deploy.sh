#!/usr/bin/env bash
# deploy report-seo บน VPS — เรียกจาก .github/workflows/deploy.yml หลัง git reset --hard แล้ว
# deploy มือ: ssh oat@76.13.197.229 'cd ~/apps/report-seo/src && git fetch origin master && git reset --hard origin/master && bash scripts/deploy.sh'
# build ล้ม = คอนเทนเนอร์เดิมรันต่อ (compose สลับหลัง build ผ่านเท่านั้น)
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p ../uploads ../logs

# dump ก่อนทุก deploy — migrate deploy ตอน start อาจแก้ schema · เก็บ 7 ชุด
if docker ps --format '{{.Names}}' | grep -qx report-seo-db; then
  mkdir -p ../backups && chmod 700 ../backups
  docker exec report-seo-db pg_dump -U postgres -Fc seodb > "../backups/pre-deploy-$(date +%Y%m%d-%H%M%S).dump"
  ls -1t ../backups/pre-deploy-*.dump | tail -n +8 | xargs -r rm -f
fi

docker compose --env-file ../.env -f docker-compose.prod.yml up -d --build

# health: หน้า login ต้อง 200 ภายใน 2 นาที (migrate + next boot)
for i in $(seq 1 60); do
  code=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3031/login || true)
  [ "$code" = 200 ] && { echo "healthy (/login 200)"; exit 0; }
  sleep 2
done
echo "health check failed: /login = $code" >&2
docker logs --tail 50 report-seo >&2
exit 1
