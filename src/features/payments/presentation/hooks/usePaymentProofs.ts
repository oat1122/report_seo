'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from '@/infrastructure/http/axios'
import type { PaymentProof, PaymentProofWithCustomer } from '../../index'

type ApiData<T> = { data: T }

export const useListPaymentProofs = (customerId: string) =>
  useQuery<PaymentProofWithCustomer[], Error>({
    queryKey: ['payments', 'proofs', customerId],
    queryFn: async () => {
      const { data } = await axios.get<ApiData<PaymentProofWithCustomer[]>>(
        `/customers/${customerId}/payments/proofs`,
      )
      return data.data
    },
    enabled: !!customerId,
  })

export const useUploadPaymentProof = () => {
  const queryClient = useQueryClient()
  return useMutation<
    PaymentProof,
    Error,
    { customerId: string; file: File; billingCycleId?: string }
  >({
    mutationFn: async ({ customerId, file, billingCycleId }) => {
      const formData = new FormData()
      formData.append('file', file)
      if (billingCycleId) {
        formData.append('billingCycleId', billingCycleId)
      }
      const { data } = await axios.post<ApiData<PaymentProof>>(
        `/customers/${customerId}/payments/proofs`,
        formData,
      )
      return data.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['payments', 'proofs', variables.customerId],
      })
      queryClient.invalidateQueries({
        queryKey: ['payments', 'cycles', variables.customerId],
      })
    },
  })
}

export const useApproveRejectProof = () => {
  const queryClient = useQueryClient()
  return useMutation<
    PaymentProof,
    Error,
    { customerId: string; proofId: string; status: 'APPROVED' | 'REJECTED' }
  >({
    mutationFn: async ({ customerId, proofId, status }) => {
      const { data } = await axios.patch<ApiData<PaymentProof>>(
        `/customers/${customerId}/payments/proofs/${proofId}/status`,
        { status },
      )
      return data.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['payments', 'proofs', variables.customerId],
      })
      queryClient.invalidateQueries({
        queryKey: ['payments', 'cycles', variables.customerId],
      })
      queryClient.invalidateQueries({
        queryKey: ['payments', 'plans', variables.customerId],
      })
    },
  })
}
