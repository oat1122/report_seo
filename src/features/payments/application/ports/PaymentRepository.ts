import { Role } from '@/types/auth'
import type { PaymentProof, PaymentProofWithCustomer } from '../../domain/PaymentProof'
import type { PaymentPlan, PaymentPlanWithCycles } from '../../domain/PaymentPlan'
import type { BillingCycle, BillingCycleWithPlan } from '../../domain/BillingCycle'
import type { ContractFile } from '../../domain/ContractFile'
import type { BillingCycleSeed } from '../../domain/policies/billing-cycle-generator'
import type { PaymentListQuery } from '../../schemas'

export interface PaymentListFilter extends PaymentListQuery {
  scopedTo: { role: Role; userId: string }
}

export interface CreatePlanData {
  type: 'MONTHLY' | 'INSTALLMENT'
  amount: number
  description: string
  billingDay?: number | null
  totalInstallments?: number | null
  startDate: Date
  endDate?: Date | null
  note?: string | null
}

export interface UpdatePlanData {
  description?: string
  amount?: number
  billingDay?: number | null
  totalInstallments?: number | null
  startDate?: Date
  endDate?: Date | null | undefined
  note?: string | null | undefined
}

export interface UpdateCycleData {
  status: 'PENDING' | 'REVIEWING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  paidDate?: Date | null | undefined
  note?: string | null | undefined
}

export interface PaymentRepository {
  // --- Payment Proof ---
  createProof(
    customerInternalId: string,
    publicUrl: string,
    billingCycleId?: string,
  ): Promise<PaymentProof>
  list(filter: PaymentListFilter): Promise<PaymentProofWithCustomer[]>
  findProofById(proofId: string): Promise<PaymentProof | null>
  /**
   * ตัดสิน proof ที่ยัง PENDING + sync สถานะ cycle/plan ใน transaction เดียว
   * คืน null ถ้า proof ไม่ PENDING แล้ว (ถูกตัดสินไปก่อน / กดซ้ำพร้อมกัน)
   */
  decideProof(proofId: string, status: 'APPROVED' | 'REJECTED'): Promise<PaymentProof | null>

  // --- Payment Plan ---
  createPlanWithCycles(
    customerId: string,
    data: CreatePlanData,
    cycles: BillingCycleSeed[],
  ): Promise<PaymentPlan>
  listPlansByCustomer(customerId: string, status?: string): Promise<PaymentPlan[]>
  findPlanById(planId: string): Promise<PaymentPlanWithCycles | null>
  updatePlan(planId: string, data: UpdatePlanData): Promise<PaymentPlan>
  cancelPlan(planId: string): Promise<PaymentPlan>

  // --- Billing Cycle ---
  findCycleById(cycleId: string): Promise<BillingCycle | null>
  /** null ถ้า cycle ไม่ใช่ของ customer นี้ — ใช้กัน IDOR ข้ามลูกค้า */
  findCycleForCustomer(cycleId: string, customerId: string): Promise<BillingCycle | null>
  listCyclesByPlan(planId: string, customerId: string): Promise<BillingCycleWithPlan[]>
  listCyclesByCustomer(customerId: string): Promise<BillingCycleWithPlan[]>
  updateCycle(cycleId: string, data: UpdateCycleData): Promise<BillingCycle>
  updatePendingCyclesAmount(planId: string, amount: number): Promise<void>
  countPendingCyclesByPlan(planId: string): Promise<number>
  completePlan(planId: string): Promise<void>
  reactivatePlan(planId: string): Promise<void>
  reactivateCancelledPlan(planId: string): Promise<PaymentPlan>

  // --- Contract File ---
  createContractFile(customerId: string, fileUrl: string, fileName: string): Promise<ContractFile>
  listContractFiles(customerId: string): Promise<ContractFile[]>
  findContractFileById(id: string): Promise<ContractFile | null>
  deleteContractFile(id: string): Promise<void>
}
