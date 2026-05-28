'use client'

import React from 'react'
import { DashboardHeader } from './DashboardHeader'
import { NotificationSocketInit } from '@/features/notifications/presentation/components/NotificationSocketInit'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <NotificationSocketInit />
      <DashboardHeader />
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
