'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from '@/infrastructure/http/axios'
import type { ApiSuccess } from '@/infrastructure/http/responses'
import type { CompanySettings } from '../../domain/CompanySettings'
import type { CompanySettingsFormInput } from '../../schemas'

const QUERY_KEY = ['company-settings'] as const

export function useGetCompanySettings() {
  return useQuery<CompanySettings | null>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data } = await axios.get<ApiSuccess<CompanySettings | null>>('/company-settings')
      return data.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpsertCompanySettings() {
  const qc = useQueryClient()
  return useMutation<CompanySettings, Error, CompanySettingsFormInput>({
    mutationFn: async (input) => {
      const { data } = await axios.put<ApiSuccess<CompanySettings>>('/company-settings', input)
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useUploadLogo() {
  const qc = useQueryClient()
  return useMutation<CompanySettings, Error, File>({
    mutationFn: async (file) => {
      const formData = new FormData()
      formData.append('logo', file)
      const { data } = await axios.post<ApiSuccess<CompanySettings>>(
        '/company-settings/logo',
        formData,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}
