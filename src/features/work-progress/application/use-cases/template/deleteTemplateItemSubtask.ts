import { BadRequestError, ConflictError, NotFoundError } from "@/lib/errors";
import type { WorkProgressTemplateRepository } from "../../ports/WorkProgressTemplateRepository";

export function deleteTemplateItemSubtaskUseCase(
  templateRepo: WorkProgressTemplateRepository,
) {
  return async (templateId: string, itemId: string, subtaskId: string) => {
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

    await templateRepo.deleteItemSubtask(subtaskId);
  };
}
