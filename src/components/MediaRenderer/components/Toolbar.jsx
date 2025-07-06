import React from "react"
import { cn } from "@/lib/utils"

export const Toolbar = ({ children, className, ...props }) => {
  return (
    <div
      {...props}
      data-testid="media-toolbar"
      className={cn(
        "flex p-[10px] bg-[#f2f2f3] dark:bg-mybgter border-b border-b-[lightgray] dark:border-[#3f3f46]",
        className
      )}
    >
      {children}
    </div>
  )
}
