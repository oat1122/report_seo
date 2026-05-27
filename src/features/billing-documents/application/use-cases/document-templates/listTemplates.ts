import type { DocumentTemplateRepository } from "../../ports/DocumentTemplateRepository";
import type { DocumentTemplateScope } from "../../../domain/DocumentTemplate";

export function listTemplatesUseCase(repo: DocumentTemplateRepository) {
  return (scope?: DocumentTemplateScope) => repo.list(scope);
}
