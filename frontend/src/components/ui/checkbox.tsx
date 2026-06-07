"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { cn } from "@/lib/utils"
import { CheckIcon, MinusIcon } from "lucide-react"

function Checkbox({
  className,
  indeterminate,
  ...props
}: CheckboxPrimitive.Root.Props & { indeterminate?: boolean }) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      indeterminate={indeterminate}
      className={cn(
        "peer relative h-4 w-4 shrink-0 rounded-[4px] border border-input bg-background outline-none",
        "transition-colors duration-150",
        "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[checked]:bg-primary data-[checked]:border-primary",
        "data-[indeterminate]:bg-primary data-[indeterminate]:border-primary",
        "hover:border-ring",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-primary-foreground">
        {indeterminate
          ? <MinusIcon className="h-3 w-3 stroke-[3]" />
          : <CheckIcon className="h-3 w-3 stroke-[3]" />
        }
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
