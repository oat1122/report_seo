import { BadRequestError, ForbiddenError } from "@/lib/errors";

/**
 * Pure policy — validate ว่า userId คนใดสามารถถูก assign ให้ customer ที่กำหนดได้
 *
 * Rule:
 * - ADMIN: assign ได้ทุก customer
 * - SEO_DEV: assign ได้เฉพาะ customer ที่ตัวเองดูแลอยู่ (customer.seoDevId === userId)
 * - role อื่น (CUSTOMER): assign ไม่ได้
 *
 * lookup function injected จาก composition root เพื่อให้ policy ไม่ผูก Prisma
 * (rule 09 — application layer ไม่ depend on infrastructure ตรง)
 */
export interface AssigneeInfo {
  id: string;
  role: string;
  deletedAt: Date | null;
}

export type AssigneeLookup = (userId: string) => Promise<AssigneeInfo | null>;

export async function assertAssigneeAllowed(
  assignedToId: string,
  customerSeoDevId: string | null,
  lookup: AssigneeLookup,
): Promise<void> {
  const user = await lookup(assignedToId);
  if (!user || user.deletedAt) {
    throw new BadRequestError("ผู้รับผิดชอบไม่พบในระบบ");
  }
  if (user.role === "ADMIN") return;
  if (user.role === "SEO_DEV" && customerSeoDevId === assignedToId) return;
  throw new ForbiddenError(
    "ผู้รับผิดชอบต้องเป็น ADMIN หรือ SEO_DEV ที่ดูแลลูกค้านี้",
  );
}
