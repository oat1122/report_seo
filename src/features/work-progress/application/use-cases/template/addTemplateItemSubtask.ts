import { BadRequestError, ConflictError, NotFoundError } from "@/lib/errors";
import { addTemplateSubtaskSchema } from "../../../schemas";
import type { WorkProgressTemplateRepository } from "../../ports/WorkProgressTemplateRepository";

export function addTemplateItemSubtaskUseCase(
  templateRepo: WorkProgressTemplateRepository,
) {
  return async (templateId: string, itemId: string, raw: unknown) => {
    const parsed = addTemplateSubtaskSchema.safeParse(raw);
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
        .join(", ");
      throw new BadRequestError(`Invalid subtask data: ${detail}`);
    }

    const item = await templateRepo.findItemById(itemId);
    if (!item) throw new NotFoundError("ไม่พบ template item");
    if (item.templateId !== templateId) {
      throw new BadRequestError("item ไม่อยู่ใน template นี้");
    }
    if (item.template.isSystem) {
      throw new ConflictError("ห้ามแก้ subtask ของ system template");
    }

    return templateRepo.addItemSubtask(itemId, parsed.data);
  };
}
