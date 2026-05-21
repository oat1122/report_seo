// Re-export shim — actual implementation moved to @/infrastructure/prisma
// New code ควร import จาก @/infrastructure/prisma โดยตรง
export { prisma, prismaBase } from "@/infrastructure/prisma/client";
export { default } from "@/infrastructure/prisma/client";
