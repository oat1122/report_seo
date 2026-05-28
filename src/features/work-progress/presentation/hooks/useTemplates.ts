'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from '@/infrastructure/http/axios'
import type {
  WorkProgressTemplate,
  WorkProgressTemplateDetail,
  UpsertTemplateInput,
  UpdateTemplateInput,
  AddTemplateItemInput,
  UpdateTemplateItemInput,
  ReorderTemplateItemsInput,
} from '@/features/work-progress'

type ApiData<T> = { data: T }

const FIVE_MINUTES = 5 * 60 * 1000

const listKey = (includeInactive: boolean) =>
  ['workProgress', 'templates', { includeInactive }] as const
const detailKey = (id: string) => ['workProgress', 'template', id] as const

interface UseTemplatesOptions {
  includeInactive?: boolean
  enabled?: boolean
}

export const useTemplates = (opts: UseTemplatesOptions = {}) => {
  const includeInactive = opts.includeInactive ?? false
  return useQuery<WorkProgressTemplate[], Error>({
    queryKey: listKey(includeInactive),
    queryFn: async () => {
      const { data } = await axios.get<ApiData<WorkProgressTemplate[]>>(
        `/work-progress/templates`,
        { params: { includeInactive } },
      )
      return data.data
    },
    staleTime: FIVE_MINUTES,
    enabled: opts.enabled ?? true,
  })
}

export const useTemplate = (id: string | null | undefined) =>
  useQuery<WorkProgressTemplateDetail, Error>({
    queryKey: detailKey(id ?? ''),
    queryFn: async () => {
      const { data } = await axios.get<ApiData<WorkProgressTemplateDetail>>(
        `/work-progress/templates/${id}`,
      )
      return data.data
    },
    enabled: !!id,
  })

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['workProgress', 'templates'] })
}

export const useCreateTemplate = () => {
  const qc = useQueryClient()
  return useMutation<WorkProgressTemplate, Error, UpsertTemplateInput>({
    mutationFn: async (body) => {
      const { data } = await axios.post<ApiData<WorkProgressTemplate>>(
        `/work-progress/templates`,
        body,
      )
      return data.data
    },
    onSuccess: () => invalidateAll(qc),
  })
}

export const useUpdateTemplate = () => {
  const qc = useQueryClient()
  return useMutation<WorkProgressTemplate, Error, { id: string; body: UpdateTemplateInput }>({
    mutationFn: async ({ id, body }) => {
      const { data } = await axios.patch<ApiData<WorkProgressTemplate>>(
        `/work-progress/templates/${id}`,
        body,
      )
      return data.data
    },
    onSuccess: (_d, { id }) => {
      invalidateAll(qc)
      qc.invalidateQueries({ queryKey: detailKey(id) as unknown as string[] })
    },
  })
}

export const useDeleteTemplate = () => {
  const qc = useQueryClient()
  return useMutation<void, Error, { id: string }>({
    mutationFn: async ({ id }) => {
      await axios.delete(`/work-progress/templates/${id}`)
    },
    onSuccess: () => invalidateAll(qc),
  })
}

export const useAddTemplateItem = () => {
  const qc = useQueryClient()
  return useMutation<unknown, Error, { templateId: string; body: AddTemplateItemInput }>({
    mutationFn: async ({ templateId, body }) => {
      const { data } = await axios.post(`/work-progress/templates/${templateId}/items`, body)
      return data
    },
    onSuccess: (_d, { templateId }) => {
      qc.invalidateQueries({
        queryKey: detailKey(templateId) as unknown as string[],
      })
    },
  })
}

export const useUpdateTemplateItem = () => {
  const qc = useQueryClient()
  return useMutation<
    unknown,
    Error,
    { templateId: string; itemId: string; body: UpdateTemplateItemInput }
  >({
    mutationFn: async ({ templateId, itemId, body }) => {
      const { data } = await axios.patch(
        `/work-progress/templates/${templateId}/items/${itemId}`,
        body,
      )
      return data
    },
    onSuccess: (_d, { templateId }) => {
      qc.invalidateQueries({
        queryKey: detailKey(templateId) as unknown as string[],
      })
    },
  })
}

export const useDeleteTemplateItem = () => {
  const qc = useQueryClient()
  return useMutation<void, Error, { templateId: string; itemId: string }>({
    mutationFn: async ({ templateId, itemId }) => {
      await axios.delete(`/work-progress/templates/${templateId}/items/${itemId}`)
    },
    onSuccess: (_d, { templateId }) => {
      qc.invalidateQueries({
        queryKey: detailKey(templateId) as unknown as string[],
      })
    },
  })
}

export const useReorderTemplateItems = () => {
  const qc = useQueryClient()
  return useMutation<unknown, Error, { templateId: string; body: ReorderTemplateItemsInput }>({
    mutationFn: async ({ templateId, body }) => {
      const { data } = await axios.post(
        `/work-progress/templates/${templateId}/items/reorder`,
        body,
      )
      return data
    },
    onSuccess: (_d, { templateId }) => {
      qc.invalidateQueries({
        queryKey: detailKey(templateId) as unknown as string[],
      })
    },
  })
}
