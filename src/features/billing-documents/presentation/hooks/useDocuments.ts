'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from '@/infrastructure/http/axios'
import type { ApiSuccess } from '@/infrastructure/http/responses'
import type { BillingDocument } from '../../domain/BillingDocument'
import type { CustomerForDocument } from '../../application/ports/BillingDocumentRepository'
import type { BillingDocumentType } from '../../domain/DocumentType'
import type { UpdateDocumentInput } from '../../schemas'

function queryKey(customerId: string) {
  return ['customer', customerId, 'billing-documents'] as const
}

export function useListDocuments(customerId: string) {
  return useQuery<BillingDocument[]>({
    queryKey: queryKey(customerId),
    queryFn: async () => {
      const { data } = await axios.get<ApiSuccess<BillingDocument[]>>(
        `/customers/${customerId}/billing-documents`,
      )
      return data.data
    },
    staleTime: 60 * 1000,
  })
}

export function useCustomerDocumentInfo(customerId: string) {
  return useQuery<CustomerForDocument>({
    queryKey: ['customer', customerId, 'billing-documents', 'customer-info'],
    queryFn: async () => {
      const { data } = await axios.get<ApiSuccess<CustomerForDocument>>(
        `/customers/${customerId}/billing-documents/customer-info`,
      )
      return data.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useDeleteDocument(customerId: string) {
  const qc = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: async (documentId) => {
      await axios.delete(`/customers/${customerId}/billing-documents/${documentId}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKey(customerId) }),
  })
}

export function useUpdateDocument(customerId: string) {
  const qc = useQueryClient()
  return useMutation<BillingDocument, Error, { documentId: string; input: UpdateDocumentInput }>({
    mutationFn: async ({ documentId, input }) => {
      const { data } = await axios.patch<ApiSuccess<BillingDocument>>(
        `/customers/${customerId}/billing-documents/${documentId}`,
        input,
      )
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKey(customerId) })
      qc.invalidateQueries({ queryKey: ['admin', 'all-billing-documents'] })
    },
  })
}

export function useUploadCustomerDocument(customerId: string) {
  const qc = useQueryClient()
  return useMutation<
    BillingDocument,
    Error,
    { file: File; type: BillingDocumentType; billingCycleId?: string | null }
  >({
    mutationFn: async ({ file, type, billingCycleId }) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      if (billingCycleId) formData.append('billingCycleId', billingCycleId)
      const { data } = await axios.post<ApiSuccess<BillingDocument>>(
        `/customers/${customerId}/billing-documents/upload`,
        formData,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKey(customerId) }),
  })
}

export function useAssignDocumentCycle(customerId: string) {
  const qc = useQueryClient()
  return useMutation<BillingDocument, Error, { documentId: string; billingCycleId: string | null }>(
    {
      mutationFn: async ({ documentId, billingCycleId }) => {
        const { data } = await axios.patch<ApiSuccess<BillingDocument>>(
          `/customers/${customerId}/billing-documents/${documentId}/cycle`,
          { billingCycleId },
        )
        return data.data
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: queryKey(customerId) })
        qc.invalidateQueries({ queryKey: ['admin', 'all-billing-documents'] })
      },
    },
  )
}
