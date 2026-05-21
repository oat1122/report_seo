import { z } from "zod";
import {
  withApiHandler,
  customerAccessGuard,
  ok,
  noContent,
} from "@/infrastructure/http";
import { deleteKeyword, keywordSchema, updateKeyword } from "@/features/keywords";

const paramsSchema = z.object({ keywordId: z.string().min(1) });

export const PUT = withApiHandler(
  { params: paramsSchema, body: keywordSchema },
  async ({ params, body }) => {
    await customerAccessGuard({ byKeywordId: params.keywordId }, "manage");
    return ok(await updateKeyword(params.keywordId, body));
  },
);

export const DELETE = withApiHandler(
  { params: paramsSchema },
  async ({ params }) => {
    await customerAccessGuard({ byKeywordId: params.keywordId }, "manage");
    await deleteKeyword(params.keywordId);
    return noContent();
  },
);
