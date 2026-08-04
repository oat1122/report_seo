'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/axios'
import type { ApiSuccess } from '@/infrastructure/http'
import type { BlogSettings } from '../../application/ports/BlogSettingsRepository'
import type { BlogArticle, BlogStageCode, CustomerKeywordOption } from '../../domain/BlogArticle'
import type {
  CreateArticleInput,
  SubmitFeedbackInput,
  UpdateArticleInput,
  UpdateBlogSettingsInput,
  UpdateStageInput,
} from '../../schemas'

export interface ArticleListPayload {
  articles: BlogArticle[]
  monthlyCount: number | null
}

export interface MonthFilter {
  year: number
  month: number
}

const base = (customerId: string) => `/customers/${customerId}/blog-articles`

export const blogPlanKeys = {
  articles: (customerId: string, filter: MonthFilter) =>
    ['blog-plan', customerId, 'articles', filter.year, filter.month] as const,
  keywords: (customerId: string) => ['blog-plan', customerId, 'keywords'] as const,
  settings: (customerId: string) => ['blog-plan', customerId, 'settings'] as const,
}

export function useBlogArticles(customerId: string, filter: MonthFilter) {
  return useQuery({
    queryKey: blogPlanKeys.articles(customerId, filter),
    queryFn: async () => {
      const { data } = await axios.get<ApiSuccess<ArticleListPayload>>(base(customerId), {
        params: filter,
      })
      return data.data
    },
    staleTime: 30_000,
  })
}

export function useBlogKeywords(customerId: string) {
  return useQuery({
    queryKey: blogPlanKeys.keywords(customerId),
    queryFn: async () => {
      const { data } = await axios.get<ApiSuccess<CustomerKeywordOption[]>>(
        `/customers/${customerId}/blog-keywords`,
      )
      return data.data
    },
    staleTime: 60_000,
  })
}

export function useBlogSettings(customerId: string) {
  return useQuery({
    queryKey: blogPlanKeys.settings(customerId),
    queryFn: async () => {
      const { data } = await axios.get<ApiSuccess<BlogSettings>>(
        `/customers/${customerId}/blog-settings`,
      )
      return data.data
    },
    staleTime: 60_000,
  })
}

/** invalidate ทุก query ของลูกค้ารายนี้ — mutation ส่วนใหญ่กระทบทั้งลิสต์และโควตา */
function useInvalidateBlogPlan(customerId: string) {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['blog-plan', customerId] })
}

export function useUpdateBlogSettings(customerId: string) {
  const invalidate = useInvalidateBlogPlan(customerId)
  return useMutation({
    mutationFn: async (input: UpdateBlogSettingsInput) => {
      const { data } = await axios.patch<ApiSuccess<BlogSettings>>(
        `/customers/${customerId}/blog-settings`,
        input,
      )
      return data.data
    },
    onSuccess: invalidate,
  })
}

export function useCreateArticle(customerId: string) {
  const invalidate = useInvalidateBlogPlan(customerId)
  return useMutation({
    mutationFn: async (input: CreateArticleInput) => {
      const { data } = await axios.post<ApiSuccess<BlogArticle>>(base(customerId), input)
      return data.data
    },
    onSuccess: invalidate,
  })
}

export function useUpdateArticle(customerId: string) {
  const invalidate = useInvalidateBlogPlan(customerId)
  return useMutation({
    mutationFn: async ({ articleId, input }: { articleId: string; input: UpdateArticleInput }) => {
      await axios.patch(`${base(customerId)}/${articleId}`, input)
    },
    onSuccess: invalidate,
  })
}

export function useDeleteArticle(customerId: string) {
  const invalidate = useInvalidateBlogPlan(customerId)
  return useMutation({
    mutationFn: async (articleId: string) => {
      await axios.delete(`${base(customerId)}/${articleId}`)
    },
    onSuccess: invalidate,
  })
}

export function useUpdateStage(customerId: string) {
  const invalidate = useInvalidateBlogPlan(customerId)
  return useMutation({
    mutationFn: async ({
      articleId,
      stageCode,
      input,
    }: {
      articleId: string
      stageCode: BlogStageCode
      input: UpdateStageInput
    }) => {
      await axios.patch(`${base(customerId)}/${articleId}/stages/${stageCode}`, input)
    },
    onSuccess: invalidate,
  })
}

export function useSubmitFeedback(customerId: string) {
  const invalidate = useInvalidateBlogPlan(customerId)
  return useMutation({
    mutationFn: async ({ articleId, input }: { articleId: string; input: SubmitFeedbackInput }) => {
      await axios.post(`${base(customerId)}/${articleId}/feedback`, input)
    },
    onSuccess: invalidate,
  })
}

export interface SubmitStageWorkVariables {
  articleId: string
  stageCode: BlogStageCode
  message: string
  linkUrl: string
  file: File | null
}

export function useSubmitStageWork(customerId: string) {
  const invalidate = useInvalidateBlogPlan(customerId)
  return useMutation({
    mutationFn: async ({
      articleId,
      stageCode,
      message,
      linkUrl,
      file,
    }: SubmitStageWorkVariables) => {
      const form = new FormData()
      if (message) form.append('message', message)
      if (linkUrl) form.append('linkUrl', linkUrl)
      if (file) form.append('file', file)
      await axios.post(`${base(customerId)}/${articleId}/stages/${stageCode}/submissions`, form)
    },
    onSuccess: invalidate,
  })
}

export function useDeleteArticleFile(customerId: string) {
  const invalidate = useInvalidateBlogPlan(customerId)
  return useMutation({
    mutationFn: async ({ articleId, fileId }: { articleId: string; fileId: string }) => {
      await axios.delete(`${base(customerId)}/${articleId}/files/${fileId}`)
    },
    onSuccess: invalidate,
  })
}
