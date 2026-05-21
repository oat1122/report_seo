import type { KeywordRepository } from "../ports/KeywordRepository";

export function deleteKeywordUseCase(repo: KeywordRepository) {
  return (keywordId: string) => repo.delete(keywordId);
}
