import type { NextStep } from '../../domain/NextStep'
import type { NextStepInput } from '../../schemas'

type WritePayload = Omit<NextStepInput, 'description'> & { description: string | null }

export interface NextStepRepository {
  findByCustomerId(customerInternalId: string): Promise<NextStep[]>
  // scope ด้วย customerInternalId เพื่อกัน IDOR ข้ามลูกค้า (rule 01)
  findById(stepId: string, customerInternalId: string): Promise<NextStep | null>
  create(customerInternalId: string, data: WritePayload, imageUrls: string[]): Promise<NextStep>
  applyUpdate(
    stepId: string,
    data: WritePayload,
    options: { imageIdsToRemove: string[]; newImageUrls: string[] },
  ): Promise<NextStep>
  delete(stepId: string): Promise<void>
}
