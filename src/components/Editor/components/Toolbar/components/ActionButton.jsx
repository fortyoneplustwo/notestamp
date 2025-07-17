import React from "react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export const ActionButton = ({ icon: Icon, title, ...props }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button {...props} size="xs" variant="ghost" className="px-1 h-full">
          <Icon size={16} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{title}</p>
      </TooltipContent>
    </Tooltip>
  )
}
