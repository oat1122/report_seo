import { NotFoundError } from "@/lib/errors";
import type { PaymentRepository } from "../../ports/PaymentRepository";
import type { ContractFileStorage } from "../../ports/ContractFileStorage";
import { resolveUploadPath } from "@/lib/upload-paths";

export function deleteContractFileUseCase(
  repo: PaymentRepository,
  storage: ContractFileStorage,
) {
  return async (contractFileId: string) => {
    const file = await repo.findContractFileById(contractFileId);
    if (!file) throw new NotFoundError("ไม่พบไฟล์สัญญา");

    await repo.deleteContractFile(contractFileId);

    const absolutePath = resolveUploadPath(file.fileUrl, "contracts");
    await storage.removeByAbsolutePath(absolutePath);
  };
}
