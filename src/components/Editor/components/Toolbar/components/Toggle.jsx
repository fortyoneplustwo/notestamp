import { cn } from "@/lib/utils"
import React from "react"

export const Toggle = ({ ref, className, active, ...props }) => (
  <span
    {...props}
    ref={ref}
    className={cn(
      className,
      active ? "text-[orangered]" : "text-[#aaa]",
      "inline-flex items-center justify-center h-6"
    )}
  />
)
