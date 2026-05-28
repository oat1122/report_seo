'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/infrastructure/http/axios'
import type { ApiSuccess } from '@/infrastructure/http/responses'
import type { BillingDocument } from '../../domain/BillingDocument'
import type { GenerateStandaloneDocumentInput } from '../../schemas'

export function useGenerateStandaloneDocument() {
  const qc = useQueryClient()
  return useMutation<BillingDocument, Error, GenerateStandaloneDocumentInput>({
    mutationFn: async (input) => {
      const { data } = await axios.post<ApiSuccess<BillingDocument>>(
        '/admin/billing-documents/generate-standalone',
        input,
      )
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ['admin', 'all-billing-documents'],
      })
    },
  })
}
