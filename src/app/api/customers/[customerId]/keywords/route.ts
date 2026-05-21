import { z } from "zod";
import {
  withApiHandler,
  customerAccessGuard,
  ok,
  created,
} from "@/infrastructure/http";
import { addKeyword, getKeywords, keywordSchema } from "@/features/keywords";

const paramsSchema = z.object({ customerId: z.string().min(1) });

export const GET = withApiHandler(
  { params: paramsSchema },
  async ({ params }) => {
    const ctx = await customerAccessGuard({ byUserId: params.customerId }, "read");
    return ok(await getKeywords(ctx.customer.id));
  },
);

export const POST = withApiHandler(
  { params: paramsSchema, body: keywordSchema },
  async ({ params, body }) => {
    const ctx = await customerAccessGuard({ byUserId: params.customerId }, "manage");
    return created(await addKeyword(ctx.customer.id, body));
  },
);
