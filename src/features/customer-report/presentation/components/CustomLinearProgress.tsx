'use client'

import React from 'react'

interface CustomLinearProgressProps {
  label: string
  value: number
  displayValue: string
  colorFunc: (val: number) => string
}

// Linear progress bar (0-100). Color รับเป็น CSS var() string จาก utils
export const CustomLinearProgress: React.FC<CustomLinearProgressProps> = ({
  label,
  value,
  displayValue,
  colorFunc,
}) => {
  const color = colorFunc(value)
  const width = Math.min(value, 100)

  return (
    <div className="flex h-full flex-col justify-center p-3 md:p-4">
      <p className="text-sm font-semibold md:text-base">{label}</p>
      <div className="mt-2 flex items-center gap-3">
        <div className="bg-muted h-2.5 flex-1 overflow-hidden rounded-full">
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${width}%`, backgroundColor: color }}
          />
        </div>
        <span className="text-sm font-semibold whitespace-nowrap">{displayValue}</span>
      </div>
    </div>
  )
}
