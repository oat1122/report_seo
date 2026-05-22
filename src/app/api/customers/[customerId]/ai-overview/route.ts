import { z } from "zod";
import {
  withApiHandler,
  customerAccessGuard,
  ok,
  created,
} from "@/infrastructure/http";
import {
  aiOverviewCreateSchema,
  createAiOverview,
  listAiOverviews,
} from "@/features/ai-overview";

const paramsSchema = z.object({ customerId: z.uuid() });

export const GET = withApiHandler(
  { params: paramsSchema },
  async ({ params }) => {
    const ctx = await customerAccessGuard({ byUserId: params.customerId }, "read");
    return ok(await listAiOverviews(ctx.customer.id));
  },
);

export const POST = withApiHandler(
  { params: paramsSchema },
  async ({ req, params }) => {
    const ctx = await customerAccessGuard({ byUserId: params.customerId }, "manage");

    const formData = await req.formData();
    const input = aiOverviewCreateSchema.parse({
      title: formData.get("title"),
      displayDate: formData.get("displayDate") || undefined,
    });
    const files = formData.getAll("files") as File[];

    return created(await createAiOverview(ctx.customer.id, input, files));
  },
);
