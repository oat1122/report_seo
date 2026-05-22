import { z } from "zod";
import {
  withApiHandler,
  customerAccessGuard,
  created,
} from "@/infrastructure/http";
import { BadRequestError } from "@/lib/errors";
import { uploadAttachment } from "@/features/work-progress";

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().uuid(),
  itemId: z.string().uuid(),
});

// Multipart upload — withApiHandler ไม่ parse multipart body จึงดึง formData() เอง
// validator (validateUploadFile) จะตรวจ magic byte + size + extension ใน use case
export const POST = withApiHandler(
  { params: paramsSchema },
  async ({ req, params, session }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "manage",
    );
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      throw new BadRequestError("กรุณาแนบไฟล์ผ่าน field 'file'");
    }
    const captionRaw = form.get("caption");
    const caption =
      typeof captionRaw === "string" && captionRaw.length > 0
        ? captionRaw
        : null;

    return created(
      await uploadAttachment(
        ctx.customer.id,
        params.planId,
        params.itemId,
        file,
        caption,
        session.user.id,
      ),
    );
  },
);
