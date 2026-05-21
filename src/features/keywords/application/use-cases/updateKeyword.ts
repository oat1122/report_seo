import { keywordSchema } from "../../schemas";
import { BadRequestError } from "@/lib/errors";
import type { KeywordRepository } from "../ports/KeywordRepository";

export function updateKeywordUseCase(repo: KeywordRepository) {
  return async (keywordId: string, raw: unknown) => {
    const parsed = keywordSchema.safeParse(raw);
    if (!parsed.success) {
      throw new BadRequestError(
        `Invalid data: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
      );
    }
    return repo.update(keywordId, parsed.data);
  };
}
