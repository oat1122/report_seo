'use client'

import { CategoryManager } from './CategoryManager'
import { StatusManager } from './StatusManager'

export function MasterTablesShell() {
  return (
    <div className="@container">
      <div className="grid items-start gap-4 @5xl:grid-cols-2 @5xl:gap-[18px]">
        <CategoryManager />
        <StatusManager />
      </div>
    </div>
  )
}
