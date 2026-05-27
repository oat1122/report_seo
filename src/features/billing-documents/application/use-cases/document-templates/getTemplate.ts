import type { DocumentTemplateRepository } from "../../ports/DocumentTemplateRepository";
import { NotFoundError } from "@/lib/errors";

export function getTemplateUseCase(repo: DocumentTemplateRepository) {
  return async (templateId: string) => {
    const template = await repo.findById(templateId);
    if (!template) throw new NotFoundError("ไม่พบ template");
    return template;
  };
}
