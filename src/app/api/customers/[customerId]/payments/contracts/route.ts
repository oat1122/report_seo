import { z } from "zod";
import {
  withApiHandler,
  customerAccessGuard,
  ok,
  created,
} from "@/infrastructure/http";
import {
  uploadContractFile,
  listContractFiles,
} from "@/features/payments";
import { BadRequestError } from "@/lib/errors";

const paramsSchema = z.object({ customerId: z.string().uuid() });

export const GET = withApiHandler(
  { params: paramsSchema },
  async ({ params }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "read",
    );
    return ok(await listContractFiles(ctx.customer.id));
  },
);

export const POST = withApiHandler(
  { params: paramsSchema },
  async ({ req, params }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "manage",
    );

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) throw new BadRequestError("กรุณาเลือกไฟล์ที่ต้องการอัปโหลด");

    const result = await uploadContractFile(file, ctx.customer.id);
    return created(result);
  },
);
