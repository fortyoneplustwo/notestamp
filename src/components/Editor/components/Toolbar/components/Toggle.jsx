import { css, cx } from "@emotion/css"
import React from "react"

export const Toggle = ({ ref, className, active, ...props }) => (
  <span
    {...props}
    ref={ref}
    className={cx(
      className,
      css`
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: ${active ? "orangered" : "#aaa"};
      `
    )}
  />
)
