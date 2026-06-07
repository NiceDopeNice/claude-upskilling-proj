"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckIcon, MinusIcon } from "lucide-react"

interface CheckboxProps {
  checked?: boolean
  indeterminate?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

function Checkbox({ checked = false, indeterminate = false, onCheckedChange, disabled, className }: CheckboxProps) {
  const active = indeterminate || checked
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange?.(!checked)}
      className={cn(
        "relative h-4 w-4 shrink-0 rounded-[4px] border border-input bg-background outline-none",
        "flex items-center justify-center transition-colors duration-150",
        "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "hover:border-ring",
        active && "bg-primary border-primary text-primary-foreground",
        className
      )}
    >
      {active && (
        indeterminate
          ? <MinusIcon className="h-3 w-3 stroke-[3]" />
          : <CheckIcon className="h-3 w-3 stroke-[3]" />
      )}
    </button>
  )
}

export { Checkbox }
