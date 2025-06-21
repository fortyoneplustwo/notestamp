import React from "react"
import { cx } from "@emotion/css"

export const Toolbar = ({ children, className, ...props }) => {
  return (
    <div
      {...props}
      data-testid="media-toolbar"
      className={cx(
        "flex p-[10px] bg-[#f2f2f3] dark:bg-mybgter border-b border-b-[lightgray] dark:border-[#3f3f46]",
        className
      )}
    >
      {children}
    </div>
  )
}
