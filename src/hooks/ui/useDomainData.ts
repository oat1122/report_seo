'use client'

import { useState } from 'react'
import {
  useGetCustomerReport,
  useGetKeywords,
  useGetRecommendKeywords,
  useSaveMetrics,
  useAddKeyword,
  useUpdateKeyword,
  useDeleteKeyword,
  useAddRecommendKeyword,
  useUpdateRecommendKeyword,
  useDeleteRecommendKeyword,
  useGetCombinedHistory,
  useGetKeywordSpecificHistory,
  useGetAiOverviews,
  useAddAiOverview,
  useUpdateAiOverview,
  useDeleteAiOverview,
} from '@/hooks/api/useCustomersApi'
import { showPromiseToast } from '@/components/shared/toast/lib/toastify'
import { KeywordReport, KeywordReportForm, KeywordRecommendForm, OverallMetricsForm } from '@/types'

/**
 * Page-scoped data + mutations สำหรับหน้า "จัดการข้อมูล Domain"
 * ขับด้วย customerId จาก route param (ไม่ผ่าน Redux) — ดู DomainDataManager
 */
export const useDomainData = (customerId: string) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isKeywordHistoryOpen, setIsKeywordHistoryOpen] = useState(false)
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordReport | null>(null)

  // customerReport เป็น source ของ metrics + ชื่อลูกค้า + domain (cache shared กับ ReportPage)
  const { data: customerReport, isLoading: isLoadingMetrics } = useGetCustomerReport(customerId)

  const { data: keywords = [], isLoading: isLoadingKeywords } = useGetKeywords(customerId)
  const { data: recommendKeywords = [], isLoading: isLoadingRecommend } =
    useGetRecommendKeywords(customerId)
  const { data: aiOverviews = [], isLoading: isLoadingAiOverviews } = useGetAiOverviews(customerId)

  const { data: historyData, isFetching: isLoadingCombinedHistory } = useGetCombinedHistory(
    isHistoryOpen ? customerId : null,
  )

  const { data: keywordHistory = [], isFetching: isLoadingSpecificHistory } =
    useGetKeywordSpecificHistory(isKeywordHistoryOpen ? (selectedKeyword?.id ?? null) : null)

  const saveMetricsMutation = useSaveMetrics()
  const addKeywordMutation = useAddKeyword()
  const updateKeywordMutation = useUpdateKeyword()
  const deleteKeywordMutation = useDeleteKeyword()
  const addRecommendKeywordMutation = useAddRecommendKeyword()
  const updateRecommendKeywordMutation = useUpdateRecommendKeyword()
  const deleteRecommendKeywordMutation = useDeleteRecommendKeyword()
  const addAiOverviewMutation = useAddAiOverview()
  const updateAiOverviewMutation = useUpdateAiOverview()
  const deleteAiOverviewMutation = useDeleteAiOverview()

  const handleSaveMetrics = async (data: Partial<OverallMetricsForm>) => {
    const promise = saveMetricsMutation.mutateAsync({
      customerId,
      metrics: data as OverallMetricsForm,
    })
    showPromiseToast(promise, {
      pending: 'กำลังบันทึก Metrics...',
      success: 'บันทึก Metrics สำเร็จ!',
      error: 'ไม่สามารถบันทึก Metrics ได้',
    })
  }

  const handleAddKeyword = async (keyword: KeywordReportForm) => {
    const promise = addKeywordMutation.mutateAsync({ customerId, keyword })
    showPromiseToast(promise, {
      pending: 'กำลังเพิ่ม Keyword...',
      success: 'เพิ่ม Keyword สำเร็จ!',
      error: 'ไม่สามารถเพิ่ม Keyword ได้',
    })
  }

  const handleDeleteKeyword = async (keywordId: string) => {
    const promise = deleteKeywordMutation.mutateAsync({ customerId, keywordId })
    showPromiseToast(promise, {
      pending: 'กำลังลบ Keyword...',
      success: 'ลบ Keyword สำเร็จ!',
      error: 'ไม่สามารถลบ Keyword ได้',
    })
  }

  const handleUpdateKeyword = async (keywordId: string, data: KeywordReportForm) => {
    const promise = updateKeywordMutation.mutateAsync({ customerId, keywordId, keyword: data })
    showPromiseToast(promise, {
      pending: 'กำลังอัปเดต Keyword...',
      success: 'อัปเดต Keyword สำเร็จ!',
      error: 'ไม่สามารถอัปเดต Keyword ได้',
    })
  }

  const handleAddRecommendKeyword = async (keyword: KeywordRecommendForm) => {
    const promise = addRecommendKeywordMutation.mutateAsync({ customerId, keyword })
    showPromiseToast(promise, {
      pending: 'กำลังเพิ่ม Recommend Keyword...',
      success: 'เพิ่ม Recommend Keyword สำเร็จ!',
      error: 'ไม่สามารถเพิ่ม Recommend Keyword ได้',
    })
  }

  const handleDeleteRecommendKeyword = async (recommendId: string) => {
    const promise = deleteRecommendKeywordMutation.mutateAsync({ customerId, recommendId })
    showPromiseToast(promise, {
      pending: 'กำลังลบ Recommend Keyword...',
      success: 'ลบ Recommend Keyword สำเร็จ!',
      error: 'ไม่สามารถลบ Recommend Keyword ได้',
    })
  }

  const handleUpdateRecommendKeyword = async (recommendId: string, data: KeywordRecommendForm) => {
    const promise = updateRecommendKeywordMutation.mutateAsync({
      customerId,
      recommendId,
      keyword: data,
    })
    showPromiseToast(promise, {
      pending: 'กำลังอัปเดต Recommend Keyword...',
      success: 'อัปเดต Recommend Keyword สำเร็จ!',
      error: 'ไม่สามารถอัปเดต Recommend Keyword ได้',
    })
  }

  const handleAddAiOverview = async (formData: FormData) => {
    const promise = addAiOverviewMutation.mutateAsync({ customerId, formData })
    showPromiseToast(promise, {
      pending: 'กำลังอัปโหลด AI Overview...',
      success: 'เพิ่ม AI Overview สำเร็จ!',
      error: 'ไม่สามารถเพิ่ม AI Overview ได้',
    })
  }

  const handleUpdateAiOverview = async (id: string, formData: FormData) => {
    const promise = updateAiOverviewMutation.mutateAsync({ customerId, id, formData })
    showPromiseToast(promise, {
      pending: 'กำลังอัปเดท AI Overview...',
      success: 'อัปเดท AI Overview สำเร็จ!',
      error: 'ไม่สามารถอัปเดท AI Overview ได้',
    })
  }

  const handleDeleteAiOverview = async (aiOverviewId: string) => {
    const promise = deleteAiOverviewMutation.mutateAsync({ customerId, aiOverviewId })
    showPromiseToast(promise, {
      pending: 'กำลังลบ AI Overview...',
      success: 'ลบ AI Overview สำเร็จ!',
      error: 'ไม่สามารถลบ AI Overview ได้',
    })
  }

  const openHistory = () => setIsHistoryOpen(true)
  const closeHistory = () => setIsHistoryOpen(false)

  const openKeywordHistory = (keyword: KeywordReport) => {
    setSelectedKeyword(keyword)
    setIsKeywordHistoryOpen(true)
  }
  const closeKeywordHistory = () => {
    setIsKeywordHistoryOpen(false)
    setSelectedKeyword(null)
  }

  return {
    customerName: customerReport?.customerName ?? '',
    domain: customerReport?.domain ?? null,
    metrics: customerReport?.metrics ?? null,
    keywords,
    recommendKeywords,
    aiOverviews,
    isLoadingMetrics,
    isLoadingKeywords,
    isLoadingRecommend,
    isLoadingAiOverviews,
    // history
    isHistoryOpen,
    historyData: historyData ?? { metricsHistory: [], keywordHistory: [], currentKeywords: [] },
    isLoadingCombinedHistory,
    openHistory,
    closeHistory,
    // keyword-specific history
    isKeywordHistoryOpen,
    selectedKeyword,
    keywordHistory,
    isLoadingSpecificHistory,
    openKeywordHistory,
    closeKeywordHistory,
    // mutations
    handleSaveMetrics,
    handleAddKeyword,
    handleDeleteKeyword,
    handleUpdateKeyword,
    handleAddRecommendKeyword,
    handleUpdateRecommendKeyword,
    handleDeleteRecommendKeyword,
    handleAddAiOverview,
    handleUpdateAiOverview,
    handleDeleteAiOverview,
  }
}
