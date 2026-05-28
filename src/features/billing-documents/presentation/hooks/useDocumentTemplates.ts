'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from '@/infrastructure/http/axios'
import type { ApiSuccess } from '@/infrastructure/http/responses'
import type {
  DocumentTemplate,
  DocumentTemplateDetail,
  DocumentTemplateItem,
  DocumentTemplateScope,
} from '../../domain/DocumentTemplate'
import type {
  CreateDocumentTemplateInput,
  UpdateDocumentTemplateInput,
  DocumentTemplateItemInput,
} from '../../schemas'

const QUERY_KEY = ['document-templates'] as const

export function useListDocumentTemplates(scope?: DocumentTemplateScope) {
  return useQuery<DocumentTemplate[]>({
    queryKey: [...QUERY_KEY, scope],
    queryFn: async () => {
      const params = scope ? `?scope=${scope}` : ''
      const { data } = await axios.get<ApiSuccess<DocumentTemplate[]>>(
        `/admin/document-templates${params}`,
      )
      return data.data
    },
    staleTime: 2 * 60 * 1000,
  })
}

export function useDocumentTemplate(templateId: string | null) {
  return useQuery<DocumentTemplateDetail>({
    queryKey: [...QUERY_KEY, templateId],
    queryFn: async () => {
      const { data } = await axios.get<ApiSuccess<DocumentTemplateDetail>>(
        `/admin/document-templates/${templateId}`,
      )
      return data.data
    },
    enabled: !!templateId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateDocumentTemplate() {
  const qc = useQueryClient()
  return useMutation<DocumentTemplateDetail, Error, CreateDocumentTemplateInput>({
    mutationFn: async (input) => {
      const { data } = await axios.post<ApiSuccess<DocumentTemplateDetail>>(
        '/admin/document-templates',
        input,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useUpdateDocumentTemplate() {
  const qc = useQueryClient()
  return useMutation<
    DocumentTemplate,
    Error,
    { templateId: string; data: UpdateDocumentTemplateInput }
  >({
    mutationFn: async ({ templateId, data: input }) => {
      const { data } = await axios.patch<ApiSuccess<DocumentTemplate>>(
        `/admin/document-templates/${templateId}`,
        input,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useDeleteDocumentTemplate() {
  const qc = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: async (templateId) => {
      await axios.delete(`/admin/document-templates/${templateId}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useUpsertDocumentTemplateItems(templateId: string) {
  const qc = useQueryClient()
  return useMutation<DocumentTemplateItem[], Error, DocumentTemplateItemInput[]>({
    mutationFn: async (items) => {
      const { data } = await axios.put<ApiSuccess<DocumentTemplateItem[]>>(
        `/admin/document-templates/${templateId}/items`,
        { items },
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}
