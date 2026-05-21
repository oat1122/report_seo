import { z } from "zod";
import { withApiHandler, customerAccessGuard, ok } from "@/infrastructure/http";
import { getKeywordHistory } from "@/features/keywords";

const paramsSchema = z.object({ keywordId: z.string().min(1) });

export const GET = withApiHandler(
  { params: paramsSchema },
  async ({ params }) => {
    const ctx = await customerAccessGuard({ byKeywordId: params.keywordId }, "read");
    return ok(
      await getKeywordHistory(params.keywordId, { onlyVisible: !ctx.canManage }),
    );
  },
);
