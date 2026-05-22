import { BadRequestError, ConflictError, NotFoundError } from "@/lib/errors";
import { addTemplateItemSchema } from "../../../schemas";
import type { WorkProgressMasterRepository } from "../../ports/WorkProgressMasterRepository";
import type { WorkProgressTemplateRepository } from "../../ports/WorkProgressTemplateRepository";

export function addTemplateItemUseCase(
  templateRepo: WorkProgressTemplateRepository,
  masterRepo: WorkProgressMasterRepository,
) {
  return async (templateId: string, raw: unknown) => {
    const parsed = addTemplateItemSchema.safeParse(raw);
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
        .join(", ");
      throw new BadRequestError(`Invalid template item data: ${detail}`);
    }
    const input = parsed.data;

    const template = await templateRepo.findById(templateId);
    if (!template) throw new NotFoundError("ไม่พบ template");
    if (template.isSystem) {
      throw new ConflictError("ห้ามเพิ่ม items ใน system template");
    }

    const category = await masterRepo.findCategoryById(input.categoryId);
    if (!category || !category.isActive) {
      throw new BadRequestError("หมวดหมู่ไม่ถูกต้องหรือถูกปิดใช้งาน");
    }

    // ถ้าไม่ส่ง orderIndex → ใส่ต่อท้าย
    const nextOrderIndex =
      input.orderIndex ??
      (template.items.length === 0
        ? 0
        : Math.max(...template.items.map((it) => it.orderIndex)) + 1);

    return templateRepo.addItem(templateId, {
      categoryId: input.categoryId,
      activity: input.activity,
      description: input.description ?? null,
      duration: input.duration ?? null,
      weight: input.weight ?? 1,
      orderIndex: nextOrderIndex,
      defaultPeriods: input.defaultPeriods ?? null,
      subtasks: input.subtasks,
    });
  };
}
