import type {
  DocumentTemplateRepository,
  CreateTemplateData,
} from "../../ports/DocumentTemplateRepository";

export function createTemplateUseCase(repo: DocumentTemplateRepository) {
  return (data: CreateTemplateData) => repo.create(data);
}
