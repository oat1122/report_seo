'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepperNavProps {
  steps: string[]
  activeStep: number
  onStepChange: (step: number) => void
}

export const StepperNav = ({ steps, activeStep, onStepChange }: StepperNavProps) => {
  return (
    <ol className="flex items-center justify-between gap-2">
      {steps.map((label, index) => {
        const isActive = index === activeStep
        const isDone = index < activeStep
        const isLast = index === steps.length - 1

        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <button
              type="button"
              onClick={() => onStepChange(index)}
              className="focus-visible:ring-ring flex items-center gap-2 rounded-md outline-none focus-visible:ring-2"
              aria-current={isActive ? 'step' : undefined}
            >
              <span
                className={cn(
                  'flex size-7 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                  isActive && 'border-info bg-info text-info-foreground',
                  isDone && 'border-success bg-success text-success-foreground',
                  !isActive && !isDone && 'border-border bg-background text-muted-foreground',
                )}
              >
                {isDone ? <Check className="size-3.5" /> : index + 1}
              </span>
              <span
                className={cn(
                  'hidden text-sm font-medium sm:inline',
                  isActive ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
            </button>
            {!isLast && (
              <span
                className={cn(
                  'h-0.5 flex-1 rounded-full transition-colors',
                  isDone ? 'bg-success' : 'bg-border',
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
