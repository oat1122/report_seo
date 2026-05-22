import { z } from "zod";
import {
  withApiHandler,
  customerAccessGuard,
  ok,
  noContent,
} from "@/infrastructure/http";
import {
  aiOverviewUpdateSchema,
  deleteAiOverview,
  imagesToDeleteSchema,
  updateAiOverview,
} from "@/features/ai-overview";
import { BadRequestError } from "@/lib/errors";

const paramsSchema = z.object({
  customerId: z.uuid(),
  id: z.uuid(),
});

function parseImagesToDelete(value: string | null): string[] {
  if (!value) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new BadRequestError("imagesToDelete ต้องเป็น JSON array ที่ถูกต้อง");
  }
  return imagesToDeleteSchema.parse(parsed);
}

export const PUT = withApiHandler(
  { params: paramsSchema },
  async ({ req, params }) => {
    const ctx = await customerAccessGuard({ byUserId: params.customerId }, "manage");

    const formData = await req.formData();
    const input = aiOverviewUpdateSchema.parse({
      title: formData.get("title"),
      displayDate: formData.get("displayDate") || undefined,
    });
    const imageIdsToDelete = parseImagesToDelete(
      formData.get("imagesToDelete") as string | null,
    );
    const files = formData.getAll("files") as File[];

    return ok(
      await updateAiOverview(ctx.customer.id, params.id, input, files, imageIdsToDelete),
    );
  },
);

export const DELETE = withApiHandler(
  { params: paramsSchema },
  async ({ params }) => {
    const ctx = await customerAccessGuard({ byUserId: params.customerId }, "manage");
    await deleteAiOverview(ctx.customer.id, params.id);
    return noContent();
  },
);
