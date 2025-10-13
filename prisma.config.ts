import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

// โหลดค่าจาก .env เข้ามาใน process.env
dotenv.config();

export default defineConfig({
  schema: "prisma/schema.prisma",
});
