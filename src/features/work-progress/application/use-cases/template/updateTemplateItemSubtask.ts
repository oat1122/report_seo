import { BadRequestError, ConflictError, NotFoundError } from "@/lib/errors";
import { updateTemplateSubtaskSchema } from "../../../schemas";
import type { WorkProgressTemplateRepository } from "../../ports/WorkProgressTemplateRepository";

export function updateTemplateItemSubtaskUseCase(
  templateRepo: WorkProgressTemplateRepository,
) {
  return async (
    templateId: string,
    itemId: string,
    subtaskId: string,
    raw: unknown,
  ) => {
    const parsed = updateTemplateSubtaskSchema.safeParse(raw);
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
        .join(", ");
      throw new BadRequestError(`Invalid subtask data: ${detail}`);
    }

    const existing = await templateRepo.findItemSubtaskById(subtaskId);
    if (!existing) throw new NotFoundError("ไม่พบ subtask");
    if (existing.templateItemId !== itemId) {
      throw new BadRequestError("subtask ไม่อยู่ใน item นี้");
    }
    if (existing.templateItem.templateId !== templateId) {
      throw new BadRequestError("subtask ไม่อยู่ใน template นี้");
    }
    if (existing.templateItem.template.isSystem) {
      throw new ConflictError("ห้ามแก้ subtask ของ system template");
    }

    return templateRepo.updateItemSubtask(subtaskId, parsed.data);
  };
}
