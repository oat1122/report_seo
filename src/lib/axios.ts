// Re-export shim — actual axios instance moved to @/infrastructure/http
// New code ควร import จาก @/infrastructure/http โดยตรง
export { default } from '@/infrastructure/http/axios'
