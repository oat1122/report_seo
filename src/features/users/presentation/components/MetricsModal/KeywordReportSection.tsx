'use client'

import React from 'react'
import type { KdLevel } from '@/types/kd'
import type { KeywordReport, KeywordReportForm } from '@/types/metrics'
import { KeywordAddCard } from './KeywordAddCard'
import { KeywordReportTable } from './KeywordReportTable'

interface KeywordReportSectionProps {
  customerId: string
  newKeyword: KeywordReportForm
  keywordsData: KeywordReport[]
  isLoading?: boolean
  editingKeywordId: string | null
  onKeywordChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeywordSelectChange: (value: KdLevel) => void
  onAddOrUpdateKeyword: () => void
  onDeleteKeyword: (id: string) => void
  onSetEditing: (keyword: KeywordReport) => void
  onClearEditing: () => void
  onViewHistory: (keyword: KeywordReport) => void
}

/** หมวด Keyword Report — การ์ดเพิ่ม Keyword + ตารางที่แก้ไขในแถวได้ */
export const KeywordReportSection: React.FC<KeywordReportSectionProps> = ({
  customerId,
  newKeyword,
  keywordsData,
  isLoading = false,
  editingKeywordId,
  onKeywordChange,
  onKeywordSelectChange,
  onAddOrUpdateKeyword,
  onDeleteKeyword,
  onSetEditing,
  onClearEditing,
  onViewHistory,
}) => {
  const editingKeyword = editingKeywordId
    ? (keywordsData.find((k) => k.id === editingKeywordId)?.keyword ?? newKeyword.keyword)
    : null

  return (
    <>
      <KeywordAddCard
        newKeyword={newKeyword}
        editingKeyword={editingKeyword}
        onKeywordChange={onKeywordChange}
        onKeywordSelectChange={onKeywordSelectChange}
        onAdd={onAddOrUpdateKeyword}
        onCancelEdit={onClearEditing}
      />
      <KeywordReportTable
        customerId={customerId}
        keywords={keywordsData}
        isLoading={isLoading}
        editingKeywordId={editingKeywordId}
        draft={newKeyword}
        onDraftChange={onKeywordChange}
        onDraftKdChange={onKeywordSelectChange}
        onSave={onAddOrUpdateKeyword}
        onCancelEdit={onClearEditing}
        onEdit={onSetEditing}
        onDelete={onDeleteKeyword}
        onViewHistory={onViewHistory}
      />
    </>
  )
}
