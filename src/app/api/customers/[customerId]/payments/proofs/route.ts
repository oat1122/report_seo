import { z } from "zod";
import {
  withApiHandler,
  customerAccessGuard,
  ok,
  created,
} from "@/infrastructure/http";
import {
  uploadPaymentProof,
  listPaymentProofs,
  paymentUploadSchema,
  paymentListQuerySchema,
} from "@/features/payments";
import { BadRequestError } from "@/lib/errors";
import { Role } from "@/types/auth";
import {
  createNotification,
  NOTIFICATION_TYPES,
} from "@/features/notifications";
import { listUserIdsByRole } from "@/features/users";

const paramsSchema = z.object({ customerId: z.string().uuid() });

export const GET = withApiHandler(
  { params: paramsSchema, query: paymentListQuerySchema },
  async ({ params, query, session }) => {
    await customerAccessGuard({ byUserId: params.customerId }, "read");
    return ok(
      await listPaymentProofs(query ?? {}, {
        user: {
          id: session.user.id,
          role: session.user.role as Role,
        },
      }),
    );
  },
);

export const POST = withApiHandler(
  { params: paramsSchema },
  async ({ req, params }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "read",
    );

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) throw new BadRequestError("กรุณาเลือกไฟล์ที่ต้องการอัปโหลด");

    const parsed = paymentUploadSchema.parse({
      customerId: ctx.customer.id,
      billingCycleId: formData.get("billingCycleId") || undefined,
    });

    const proof = await uploadPaymentProof(
      file,
      parsed.customerId,
      parsed.billingCycleId,
    );

    listUserIdsByRole(Role.ADMIN).then((adminIds) => {
      if (adminIds.length > 0) {
        createNotification({
          type: NOTIFICATION_TYPES.PAYMENT_UPLOADED,
          recipientUserIds: adminIds,
          actorId: ctx.customer.userId,
          title: "อัปโหลดหลักฐานชำระเงิน",
          body: "ลูกค้าอัปโหลดหลักฐานการชำระเงิน รอตรวจสอบ",
          metadata: { url: `/admin/customers/${params.customerId}/payments` },
        }).catch(() => {});
      }
    }).catch(() => {});

    return created({
      id: proof.id,
      uploadUrl: proof.uploadUrl,
      status: proof.status,
      uploadDate: proof.uploadDate,
    });
  },
);
