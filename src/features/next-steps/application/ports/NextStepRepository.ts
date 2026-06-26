import type { NextStep } from '../../domain/NextStep'
import type { NextStepInput } from '../../schemas'

type WritePayload = Omit<NextStepInput, 'description'> & { description: string | null }

export interface NextStepRepository {
  findByCustomerId(customerInternalId: string): Promise<NextStep[]>
  create(customerInternalId: string, data: WritePayload): Promise<NextStep>
  // update/delete ถูก scope ด้วย customerInternalId เพื่อกัน IDOR ข้ามลูกค้า (rule 01)
  update(stepId: string, customerInternalId: string, data: WritePayload): Promise<NextStep>
  delete(stepId: string, customerInternalId: string): Promise<void>
}
