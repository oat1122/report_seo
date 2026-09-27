import { describe, expect, it, vi } from 'vitest'
import { NotFoundError, BadRequestError } from '@/lib/errors'
import type { PaymentRepository } from '../../ports/PaymentRepository'
import { approveRejectProofUseCase } from '../proof/approveRejectProof'
import { updateBillingCycleUseCase } from '../cycle/updateBillingCycle'
import { cancelPaymentPlanUseCase } from '../plan/cancelPaymentPlan'
import { uploadPaymentProofUseCase } from '../uploadPaymentProof'

// IDOR: guard เช็คลูกค้าใน path แต่ id ลูก (proof/cycle/plan) ต้องเป็นของลูกค้าคนนั้นด้วย
const A = 'customer-a'
const B = 'customer-b'

const fakeRepo = (overrides: Partial<PaymentRepository>) =>
  ({
    decideProof: vi.fn(),
    updateCycle: vi.fn(),
    cancelPlan: vi.fn(),
    createProof: vi.fn(),
    ...overrides,
  }) as unknown as PaymentRepository

describe('payments are scoped to the customer in the path', () => {
  it('approveRejectProof rejects a proof of another customer', async () => {
    const repo = fakeRepo({
      findProofById: async () => ({ id: 'p', customerId: B, status: 'PENDING' }) as never,
    })
    await expect(approveRejectProofUseCase(repo)(A, 'p', 'APPROVED')).rejects.toBeInstanceOf(
      NotFoundError,
    )
    expect(repo.decideProof).not.toHaveBeenCalled()
  })

  it('approveRejectProof refuses to re-decide a reviewed proof', async () => {
    const repo = fakeRepo({
      findProofById: async () => ({ id: 'p', customerId: A, status: 'APPROVED' }) as never,
    })
    await expect(approveRejectProofUseCase(repo)(A, 'p', 'REJECTED')).rejects.toBeInstanceOf(
      BadRequestError,
    )
  })

  it('updateBillingCycle looks the cycle up by customer', async () => {
    const findCycleForCustomer = vi.fn(async () => null)
    const repo = fakeRepo({ findCycleForCustomer })
    await expect(
      updateBillingCycleUseCase(repo)(A, 'c', { status: 'PAID' }),
    ).rejects.toBeInstanceOf(NotFoundError)
    expect(findCycleForCustomer).toHaveBeenCalledWith('c', A)
    expect(repo.updateCycle).not.toHaveBeenCalled()
  })

  it('cancelPaymentPlan rejects a plan of another customer', async () => {
    const repo = fakeRepo({
      findPlanById: async () => ({ id: 'pl', customerId: B, status: 'ACTIVE' }) as never,
    })
    await expect(cancelPaymentPlanUseCase(repo)(A, 'pl')).rejects.toBeInstanceOf(NotFoundError)
    expect(repo.cancelPlan).not.toHaveBeenCalled()
  })

  it('uploadPaymentProof rejects a cycle of another customer before writing the file', async () => {
    const storage = { validateAndWrite: vi.fn(), removeByAbsolutePath: vi.fn() }
    const repo = fakeRepo({ findCycleForCustomer: async () => null })
    await expect(
      uploadPaymentProofUseCase(repo, storage)({} as File, A, 'cycle-of-b'),
    ).rejects.toBeInstanceOf(NotFoundError)
    expect(storage.validateAndWrite).not.toHaveBeenCalled()
  })
})
