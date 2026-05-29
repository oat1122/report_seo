'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/infrastructure/http/axios'
import type { UpdateCustomerInfoInput } from '../../schemas'

interface UpdateCustomerInfoVars {
  customerId: string
  info: UpdateCustomerInfoInput
}

export function useUpdateCustomerInfo() {
  const qc = useQueryClient()
  return useMutation<void, Error, UpdateCustomerInfoVars>({
    mutationFn: async ({ customerId, info }) => {
      await axios.patch(`/admin/customers/${customerId}`, info)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'customers-search'] })
    },
  })
}
